/** Mirrors order-service ORDER_STATUSES (API English). */
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

/** French label for storefront UI. */
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

/** Ordered steps for timeline (excluding cancelled). */
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

/** Current step index for active timeline (0..3), or -1 if cancelled/unknown. */
export function orderTimelineIndex(status: OrderLifecycleStatus): number {
  if (status === 'cancelled') return -1;
  return STEP_INDEX[status] ?? -1;
}

export function isOrderDelivered(status: OrderLifecycleStatus): boolean {
  return status === 'delivered';
}
