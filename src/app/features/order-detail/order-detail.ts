import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmailService } from '../../core/services/email.service';
import { MessagesService } from '../../core/services/messages.service';
import { OrderReturnRequest, OrderReturnService } from '../../core/services/order-return.service';
import { TemporalDataStore } from '../../core/services/temporal-data.store';
import { UserSessionStore } from '../../core/services/user-session.store';
import { AmazCurrencyPipe } from '../../shared/pipes/currency.pipe';

/** Délai de retour en jours après livraison. */
export const RETURN_DAYS = 14;

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, FormsModule, AmazCurrencyPipe],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss'
})
export class OrderDetail {
  returnFormOpen = false;
  returnReason = '';
  returnError = '';
  returnSuccess = '';
  selectedItems: Record<string, boolean> = {};
  vendorMessageDraft = '';
  vendorMessageError = '';
  vendorMessageSuccess = '';

  private readonly vendorId = 'vendor_demo_01';
  private readonly vendorName = 'Amaz Vendor';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly temporal: TemporalDataStore,
    private readonly emailService: EmailService,
    private readonly messagesService: MessagesService,
    private readonly userSession: UserSessionStore,
    readonly orderReturn: OrderReturnService
  ) {}

  get justPlaced(): boolean {
    return this.route.snapshot.queryParamMap.get('placed') === '1';
  }

  get orderId(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  get order() {
    const id = this.orderId;
    return id ? this.temporal.getOrderById(id) : undefined;
  }

  get canReturn(): boolean {
    const o = this.order;
    if (!o || o.statut !== 'livree' || !o.deliveredAt) return false;
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
    await this.messagesService.connectRealtime(session.id);
    this.messagesService.sendToVendor({
      userId: session.id,
      userName: session.nom,
      vendorId: this.vendorId,
      vendorName: this.vendorName,
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

  formatDate(ts: number | undefined): string {
    if (!ts) return '-';
    return new Date(ts).toLocaleDateString('fr-FR', { dateStyle: 'medium' });
  }
}
