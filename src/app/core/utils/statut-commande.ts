/** Reprend les statuts ORDER_STATUSES du order-service (API en anglais). */
export type OrderLifecycleStatus =
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'unknown';

export function parseLifecycleStatus(raw: unknown): OrderLifecycleStatus {
  const s = String(raw || '').toLowerCase();
  if (['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(s)) {
    return s as OrderLifecycleStatus;
  }
  return 'unknown';
}

/** Libellé français pour l'interface vitrine. */
export function orderStatusLabelFr(status: OrderLifecycleStatus): string {
  switch (status) {
    case 'confirmed':
      return 'Confirmée';
    case 'preparing':
      return 'En préparation';
    case 'shipped':
      return 'Expédiée';
    case 'delivered':
      return 'Livrée';
    case 'cancelled':
      return 'Annulée';
    default:
      return 'En attente';
  }
}

/** Étapes ordonnées pour la frise chronologique (hors annulation). */
export const ORDER_TIMELINE_STEPS: OrderLifecycleStatus[] = [
  'confirmed',
  'preparing',
  'shipped',
  'delivered'
];

const STEP_INDEX: Record<OrderLifecycleStatus, number> = {
  confirmed: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
  unknown: -1
};

/** Index de l'étape courante dans la frise (0..3), ou -1 si annulée/inconnue. */
export function orderTimelineIndex(status: OrderLifecycleStatus): number {
  if (status === 'cancelled') return -1;
  return STEP_INDEX[status] ?? -1;
}

export function isOrderDelivered(status: OrderLifecycleStatus): boolean {
  return status === 'delivered';
}
