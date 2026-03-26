import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EmailService } from '../../core/services/email.service';
import { MessagesService } from '../../core/services/messages.service';
import { OrderReturnRequest, OrderReturnService } from '../../core/services/order-return.service';
import { mapOrderFromApi, OrdersStateStore } from '../../core/services/orders-state.store';
import { OrdersService } from '../../core/services/orders.service';
import { ShareService } from '../../core/services/share.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductCatalogStore } from '../../core/services/product-catalog.store';
import { UserSessionStore } from '../../core/services/user-session.store';
import {
  ORDER_TIMELINE_STEPS,
  orderTimelineIndex,
  type OrderLifecycleStatus
} from '../../core/utils/order-status';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { OrderStatusLabelPipe } from '../../shared/pipes/order-status-label.pipe';

/** Délai de retour en jours après livraison. */
export const RETURN_DAYS = 14;

interface OrderOneResponse {
  success?: boolean;
  data?: unknown;
}

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, FormsModule, AmazCurrencyPipe, OrderStatusLabelPipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail implements OnInit, OnDestroy {
  returnFormOpen = false;
  returnReason = '';
  returnError = '';
  returnSuccess = '';
  selectedItems: Record<string, boolean> = {};
  vendorMessageDraft = '';
  vendorMessageError = '';
  vendorMessageSuccess = '';
  shareHint = '';
  statusAnnouncement = '';
  loadingDetail = false;

  readonly timelineSteps = ORDER_TIMELINE_STEPS;

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private readonly onVisibility = () => {
    if (document.visibilityState === 'visible') {
      void this.refreshOrder();
    }
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly ordersState: OrdersStateStore,
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
    private readonly messagesService: MessagesService,
    private readonly userSession: UserSessionStore,
    private readonly shareService: ShareService,
    private readonly toast: ToastService,
    readonly orderReturn: OrderReturnService,
    private readonly productCatalog: ProductCatalogStore
  ) {}

  get justPlaced(): boolean {
    return this.route.snapshot.queryParamMap.get('placed') === '1';
  }

  get orderId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get order() {
    const id = this.orderId;
    return id ? this.ordersState.getOrderById(id) : undefined;
  }

  get canReturn(): boolean {
    const o = this.order;
    if (!o || o.lifecycleStatus !== 'delivered' || !o.deliveredAt) return false;
    const deadline = o.deliveredAt + RETURN_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() <= deadline;
  }

  get returnDeadline(): string | null {
    const o = this.order;
    if (!o?.deliveredAt) return null;
    const d = new Date(o.deliveredAt + RETURN_DAYS * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('fr-FR', { dateStyle: 'long' });
  }

  get hasReturnRequest(): boolean {
    const id = this.orderId;
    return id ? this.orderReturn.hasReturnRequest(id) : false;
  }

  get returnRequest(): OrderReturnRequest | null {
    const id = this.orderId;
    return id ? this.orderReturn.getReturnRequest(id) : null;
  }

  get selectedItemIds(): string[] {
    return Object.entries(this.selectedItems)
      .filter(([, checked]) => checked)
      .map(([id]) => id);
  }

  get canSubmitReturn(): boolean {
    return this.selectedItemIds.length > 0 && this.returnReason.trim().length >= 8;
  }

  ngOnInit(): void {
    void this.refreshOrder();
    this.route.paramMap.subscribe(() => void this.refreshOrder());
    document.addEventListener('visibilitychange', this.onVisibility);
    this.pollTimer = setInterval(() => void this.refreshOrder(), 60_000);
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibility);
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  async refreshOrder(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || !this.userSession.isLoggedIn()) return;
    const prevStatus = this.ordersState.getOrderById(id)?.lifecycleStatus;
    this.loadingDetail = true;
    try {
      const res = (await firstValueFrom(this.ordersService.getById(id))) as OrderOneResponse;
      if (res?.data) {
        const mapped = mapOrderFromApi(res.data);
        this.ordersState.upsertOrder(mapped);
        this.ordersState.acknowledgeOrderStatusSeen(mapped);
        const next = mapped.lifecycleStatus;
        if (prevStatus && next !== prevStatus) {
          this.statusAnnouncement = 'Statut de la commande mis à jour.';
          this.toast.show('Statut de la commande mis à jour.', 'info', 3500);
        }
      }
    } catch {
      this.toast.show('Impossible de synchroniser la commande.', 'error');
    } finally {
      this.loadingDetail = false;
    }
  }

  stepIndex(status: OrderLifecycleStatus): number {
    return orderTimelineIndex(status);
  }

  stepComplete(step: OrderLifecycleStatus): boolean {
    const o = this.order;
    if (!o || o.lifecycleStatus === 'cancelled') return false;
    const cur = orderTimelineIndex(o.lifecycleStatus);
    const si = ORDER_TIMELINE_STEPS.indexOf(step);
    if (cur < 0) return false;
    return si <= cur;
  }

  stepCurrent(step: OrderLifecycleStatus): boolean {
    const o = this.order;
    if (!o) return false;
    return o.lifecycleStatus === step;
  }

  openReturnForm(): void {
    this.returnFormOpen = true;
    this.returnError = '';
    this.returnSuccess = '';
    this.selectedItems = {};
    for (const item of this.order?.items ?? []) {
      this.selectedItems[item.productId] = false;
    }
  }

  closeReturnForm(): void {
    this.returnFormOpen = false;
    this.returnError = '';
  }

  requestReturn(): void {
    const id = this.orderId;
    const o = this.order;
    if (!id || !o) return;

    const itemIds = this.selectedItemIds;
    const reason = this.returnReason.trim();
    if (!itemIds.length) {
      this.returnError = 'Sélectionnez au moins un article à retourner.';
      return;
    }
    if (reason.length < 8) {
      this.returnError = 'Le motif de retour doit contenir au moins 8 caractères.';
      return;
    }

    const created = this.orderReturn.createReturnRequest({
      orderId: id,
      itemIds,
      reason
    });
    if (!created) {
      this.returnError = 'Impossible de créer la demande de retour.';
      return;
    }

    const selectedTitles = (o.items ?? [])
      .filter((item) => itemIds.includes(item.productId))
      .map((item) => item.titre);

    void this.emailService.sendReturnRequestWithQr(
      this.userSession.session()?.email ?? 'client@amaz.demo',
      {
        requestId: created.requestId,
        orderId: created.orderId,
        reason: created.reason,
        itemTitles: selectedTitles,
        qrImageUrl: created.qrImageUrl
      }
    );

    this.returnFormOpen = false;
    this.returnReason = '';
    this.returnError = '';
    this.returnSuccess = 'Demande envoyée. Un email contenant le QR code a été généré.';
  }

  async downloadReturnQr(): Promise<void> {
    const request = this.returnRequest;
    if (!request?.qrImageUrl) return;

    try {
      const response = await fetch(request.qrImageUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `retour-${request.requestId}.png`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement('a');
      link.href = request.qrImageUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.click();
    }
  }

  downloadReceipt(): void {
    const o = this.order;
    if (!o?.receiptDataUrl) return;
    const link = document.createElement('a');
    link.href = o.receiptDataUrl;
    link.download = `recu-${o.id}.pdf`;
    link.click();
  }

  async shareOrderLink(): Promise<void> {
    const id = this.orderId;
    if (!id) return;
    this.shareHint = '';
    const url = this.shareService.absoluteUrl(`/commandes/${id}`);
    await this.shareService.shareOrCopy({
      title: `Commande ${id}`,
      text: 'Lien vers ma commande Amaz (réservé à mon compte connecté).',
      url
    });
    const msg =
      this.shareService.getMessage() ||
      'Le lien ouvre le détail uniquement si vous êtes connecté avec le même compte.';
    this.shareHint = msg;
    this.toast.show(msg, 'success', 4000);
    setTimeout(() => {
      this.shareHint = '';
      this.shareService.clearMessage();
    }, 4000);
  }

  async sendMessageToVendor(): Promise<void> {
    const session = this.userSession.hasValidSession();
    const order = this.order;
    if (!session || !order) return;

    const content = this.vendorMessageDraft.trim();
    if (content.length < 5) {
      this.vendorMessageError = 'Le message doit contenir au moins 5 caractères.';
      return;
    }

    this.vendorMessageError = '';
    const firstItem = order.items?.[0];
    const catalogProduct = firstItem?.productId
      ? this.productCatalog.byId(firstItem.productId)
      : undefined;
    const vendorDisplay =
      catalogProduct?.nomVendeur || firstItem?.nomVendeur || 'Vendeur';
    await this.messagesService.connectRealtime(session.id);
    this.messagesService.sendToVendor({
      userId: session.id,
      userName: session.nom,
      vendorId: firstItem?.vendorId || catalogProduct?.vendorId || 'vendor_unknown',
      vendorName: vendorDisplay,
      content,
      subject: `Question commande: ${order.id}`,
      productId: firstItem?.productId,
      productTitle: firstItem?.titre,
      orderId: order.id
    });
    this.vendorMessageDraft = '';
    this.vendorMessageSuccess = 'Message envoyé au vendeur.';
    setTimeout(() => {
      this.vendorMessageSuccess = '';
    }, 2500);
  }

  historyActorLabel(actorType: string): string {
    switch (String(actorType || '').toLowerCase()) {
      case 'vendor':
        return 'Vendeur';
      case 'user':
        return 'Client';
      case 'system':
      default:
        return 'Système';
    }
  }

  formatDate(ts: number | undefined): string {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
