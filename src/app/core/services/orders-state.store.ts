import { Injectable, effect, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { DeliveryAddress } from './address-book.store';
import type { CartItem } from './cart.store';
import type { CatalogProduct } from './product-catalog.store';
import { parseLifecycleStatus, type OrderLifecycleStatus } from '../utils/order-status';
import { AiService } from './ai.service';
import { ProductCatalogStore } from './product-catalog.store';
import { OrdersService } from './orders.service';
import { UserSessionStore } from './user-session.store';

export type Validite = 'actif' | 'a_actualiser';

export interface Recommendation {
  id: string;
  titre: string;
  categorie: string;
  ville: string;
  prix: number;
  createdAt: number;
  validUntil: number;
  t: number;
  validite: Validite;
}

export interface CommandeItem extends CartItem {
  vendorId?: string;
}

/** Append-only status transitions from order-service (`statusHistory`). */
export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actorType: string;
  actorId?: string | null;
  createdAt: number;
}

export interface CommandeState {
  id: string;
  /** Fulfillment status from API (1:1 with order-service). */
  lifecycleStatus: OrderLifecycleStatus;
  createdAt: number;
  updatedAt?: number;
  /** Minutes since order creation (informational, not shipping state). */
  t: number;
  validite: Validite;
  items?: CommandeItem[];
  total?: number;
  adresseLivraison?: DeliveryAddress;
  methodePaiement?: string;
  deliveryDate?: number;
  deliveredAt?: number;
  receiptDataUrl?: string;
  /** Newest-first audit trail when API returns it. */
  statusHistory?: OrderStatusHistoryEntry[];
}

export interface OrdersSnapshot {
  now: number;
  recommandations: Recommendation[];
  commandes: CommandeState[];
}

interface OrdersListResponse {
  success?: boolean;
  data?: {
    items?: unknown[];
  };
}

interface OrderItemResponse {
  success?: boolean;
  data?: unknown;
}

function toTimestamp(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function mapOrderFromApi(raw: any): CommandeState {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item: any) => ({
        productId: String(item?.productId || ''),
        titre: String(item?.title || item?.productName || ''),
        prixUnitaire: toNumber(item?.price ?? item?.unitPrice),
        quantite: toNumber(item?.quantity, 1),
        imagePrincipale: String(item?.image || ''),
        vendorId: item?.vendorId ? String(item.vendorId) : undefined,
        nomVendeur: item?.nomVendeur
          ? String(item.nomVendeur)
          : item?.vendorName
            ? String(item.vendorName)
            : undefined
      }))
    : [];

  const createdAt = toTimestamp(raw?.createdAt);
  const deliveryDate = raw?.estimatedDeliveryAt ? toTimestamp(raw.estimatedDeliveryAt) : undefined;
  const deliveredAt = raw?.deliveredAt ? toTimestamp(raw.deliveredAt) : undefined;
  const updatedAt = raw?.updatedAt != null ? toTimestamp(raw.updatedAt) : undefined;

  const statusHistory: OrderStatusHistoryEntry[] | undefined = Array.isArray(raw?.statusHistory)
    ? raw.statusHistory.map((h: Record<string, unknown>) => ({
        id: String(h['id'] ?? ''),
        fromStatus: h['fromStatus'] != null ? String(h['fromStatus']) : null,
        toStatus: String(h['toStatus'] ?? ''),
        actorType: String(h['actorType'] ?? 'system'),
        actorId: h['actorId'] != null ? String(h['actorId']) : null,
        createdAt: toTimestamp(h['createdAt'])
      }))
    : undefined;

  return {
    id: String(raw?.id || ''),
    lifecycleStatus: parseLifecycleStatus(raw?.status),
    createdAt,
    updatedAt,
    t: 0,
    validite: 'actif',
    items,
    total: toNumber(raw?.total),
    adresseLivraison: raw?.shippingAddress || undefined,
    methodePaiement: String(raw?.paymentMethod || 'card'),
    deliveryDate,
    deliveredAt,
    statusHistory
  };
}

/** Rotate through in-stock products so home cards change over time without extra HTTP. */
function rotatingInStockPick(products: CatalogProduct[], size: number, now: number): CatalogProduct[] {
  if (products.length <= size) {
    return [...products];
  }
  const tickMs = 120_000;
  const period = Math.floor(now / tickMs);
  const start = period % products.length;
  const out: CatalogProduct[] = [];
  for (let i = 0; i < size; i++) {
    out.push(products[(start + i) % products.length]);
  }
  return out;
}

function mapRecommendation(product: CatalogProduct, index: number, now: number): Recommendation {
  const createdAt = product.createdAt || now;
  const validUntil = createdAt + (45 + index * 5) * 60 * 1000;
  const t = Math.max(0, Math.round((now - createdAt) / 60000));
  return {
    id: product.id,
    titre: product.titre,
    categorie: product.categorie,
    ville: product.ville,
    prix: product.prix,
    createdAt,
    validUntil,
    t,
    validite: now <= validUntil ? 'actif' : 'a_actualiser'
  };
}

function orderSeenStorageKey(orderId: string): string {
  return `amaz_ord_seen_${orderId}`;
}

@Injectable({ providedIn: 'root' })
export class OrdersStateStore {
  private readonly ordersSignal = signal<CommandeState[]>([]);
  private readonly receiptByOrderId = new Map<string, string>();

  /** Product ids from POST /ai/recommendations (resolved against catalog). */
  private aiBoostIds: string[] = [];
  private lastAiFetchMs = 0;
  private aiRefreshInFlight = false;

  /** True while GET /commandes is in flight. */
  readonly ordersLoading = signal(false);

  readonly snapshot = signal<OrdersSnapshot>({
    now: Date.now(),
    recommandations: [],
    commandes: []
  });

  constructor(
    private readonly ordersService: OrdersService,
    private readonly productCatalog: ProductCatalogStore,
    private readonly userSession: UserSessionStore,
    private readonly aiService: AiService
  ) {
    effect(() => {
      const session = this.userSession.session();
      if (!session) {
        this.ordersSignal.set([]);
        this.aiBoostIds = [];
        this.lastAiFetchMs = 0;
        this.recomputeSnapshot();
        return;
      }
      void this.loadOrders();
    });

    effect(() => {
      this.productCatalog.products();
      this.recomputeSnapshot();
    });

    effect(() => {
      this.userSession.session();
      this.productCatalog.products();
      void this.refreshAiRecommendations();
    });

    setInterval(() => this.recomputeSnapshot(), 30000);
    this.recomputeSnapshot();
  }

  private async refreshAiRecommendations(): Promise<void> {
    if (!this.userSession.isLoggedIn()) {
      if (this.aiBoostIds.length) {
        this.aiBoostIds = [];
        this.recomputeSnapshot();
      }
      return;
    }

    const now = Date.now();
    if (this.aiRefreshInFlight) {
      return;
    }
    if (now - this.lastAiFetchMs < 300_000 && this.lastAiFetchMs > 0) {
      return;
    }

    this.aiRefreshInFlight = true;
    try {
      const res = await firstValueFrom(this.aiService.getRecommendations({ requete: 'pour vous' }));
      const recs =
        (res as { data?: { recommendations?: Array<{ id?: string }> } })?.data?.recommendations ?? [];
      this.aiBoostIds = recs.map((r) => String(r?.id || '')).filter(Boolean).slice(0, 12);
    } catch {
      this.aiBoostIds = [];
    } finally {
      this.lastAiFetchMs = Date.now();
      this.aiRefreshInFlight = false;
    }
    this.recomputeSnapshot();
  }

  private pickHomeCatalogProducts(now: number): CatalogProduct[] {
    const list = this.productCatalog.products().filter((p) => (p.stock ?? 0) > 0);
    if (!list.length) {
      return [];
    }

    const byId = new Map(list.map((p) => [p.id, p]));
    const fromAi: CatalogProduct[] = [];
    for (const id of this.aiBoostIds) {
      const p = byId.get(id);
      if (p) {
        fromAi.push(p);
      }
      if (fromAi.length >= 8) {
        break;
      }
    }

    if (this.aiBoostIds.length > 0 && fromAi.length >= 4) {
      const used = new Set(fromAi.map((p) => p.id));
      const restPool = list.filter((p) => !used.has(p.id));
      const rest = rotatingInStockPick(restPool, 8 - fromAi.length, now);
      return [...fromAi, ...rest].slice(0, 8);
    }

    return rotatingInStockPick(list, 8, now);
  }

  async loadOrders(): Promise<void> {
    if (!this.userSession.isLoggedIn()) {
      this.ordersSignal.set([]);
      this.ordersLoading.set(false);
      this.recomputeSnapshot();
      return;
    }

    this.ordersLoading.set(true);
    try {
      const response = await firstValueFrom(this.ordersService.list());
      const items = ((response as OrdersListResponse).data?.items || []).map((item) =>
        mapOrderFromApi(item)
      );
      for (const o of items) {
        const k = orderSeenStorageKey(o.id);
        if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem(k)) {
          sessionStorage.setItem(k, String(o.updatedAt ?? o.createdAt));
        }
      }
      this.ordersSignal.set(items);
      this.recomputeSnapshot();
    } catch (err) {
      throw err;
    } finally {
      this.ordersLoading.set(false);
    }
  }

  /** True when API updatedAt is newer than last acknowledged (sessionStorage). */
  shouldShowStatusHighlight(order: CommandeState): boolean {
    if (typeof sessionStorage === 'undefined') return false;
    const u = order.updatedAt ?? 0;
    if (!u) return false;
    const seen = Number(sessionStorage.getItem(orderSeenStorageKey(order.id)) || '0');
    return u > seen;
  }

  acknowledgeOrderStatusSeen(order: CommandeState): void {
    if (typeof sessionStorage === 'undefined') return;
    const u = order.updatedAt ?? order.createdAt;
    sessionStorage.setItem(orderSeenStorageKey(order.id), String(u));
  }

  /** Merge or append one order (e.g. after GET /commandes/:id). */
  upsertOrder(mapped: CommandeState): void {
    this.ordersSignal.update((orders) => {
      const idx = orders.findIndex((o) => o.id === mapped.id);
      if (idx === -1) {
        return [mapped, ...orders];
      }
      const prev = orders[idx];
      const receipt = this.receiptByOrderId.get(mapped.id);
      const next = {
        ...mapped,
        receiptDataUrl: receipt || mapped.receiptDataUrl || prev.receiptDataUrl,
        statusHistory: mapped.statusHistory ?? prev.statusHistory
      };
      return [...orders.slice(0, idx), next, ...orders.slice(idx + 1)];
    });
    this.recomputeSnapshot();
  }

  async addCommandeFromCart(
    cartItems: CartItem[],
    opts?: {
      adresseLivraison?: DeliveryAddress;
      methodePaiement?: string;
      receiptDataUrl?: string;
    }
  ): Promise<CommandeState | null> {
    if (!cartItems.length) {
      return null;
    }

    const response = await firstValueFrom(
      this.ordersService.create({
        articles: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantite
        })),
        adresseLivraison: opts?.adresseLivraison,
        methodePaiement: opts?.methodePaiement
      })
    );

    const raw = (response as OrderItemResponse).data;
    if (!raw) {
      return null;
    }

    const mapped = mapOrderFromApi(raw);
    if (opts?.receiptDataUrl) {
      this.receiptByOrderId.set(mapped.id, opts.receiptDataUrl);
    }

    this.ordersSignal.update((orders) => [mapped, ...orders.filter((order) => order.id !== mapped.id)]);
    this.recomputeSnapshot();
    return this.getOrderById(mapped.id) ?? null;
  }

  markDelivered(orderId: string): void {
    this.ordersSignal.update((orders) =>
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              lifecycleStatus: 'delivered' as OrderLifecycleStatus,
              deliveredAt: Date.now()
            }
          : order
      )
    );
    this.recomputeSnapshot();
  }

  getOrderById(orderId: string): CommandeState | undefined {
    return this.snapshot().commandes.find((order) => order.id === orderId);
  }

  private recomputeSnapshot(): void {
    const now = Date.now();
    const recommandations = this.pickHomeCatalogProducts(now).map((product, index) =>
      mapRecommendation(product, index, now)
    );

    const commandes = this.ordersSignal().map((order) => {
      const t = Math.max(0, Math.round((now - order.createdAt) / 60000));
      const validite: Validite = t <= 120 ? 'actif' : 'a_actualiser';
      return {
        ...order,
        t,
        validite,
        receiptDataUrl: this.receiptByOrderId.get(order.id) || order.receiptDataUrl
      };
    });

    this.snapshot.set({
      now,
      recommandations,
      commandes
    });
  }
}
