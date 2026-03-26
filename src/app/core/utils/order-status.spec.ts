import { describe, expect, it } from 'vitest';

import {
  orderStatusLabelFr,
  orderTimelineIndex,
  parseLifecycleStatus
} from './order-status';

describe('parseLifecycleStatus', () => {
  it('maps known API statuses', () => {
    expect(parseLifecycleStatus('shipped')).toBe('shipped');
    expect(parseLifecycleStatus('CONFIRMED')).toBe('confirmed');
  });

  it('returns unknown for invalid', () => {
    expect(parseLifecycleStatus('')).toBe('unknown');
    expect(parseLifecycleStatus('garbage')).toBe('unknown');
  });
});

describe('orderStatusLabelFr', () => {
  it('returns French labels', () => {
    expect(orderStatusLabelFr('shipped')).toBe('Expédiée');
    expect(orderStatusLabelFr('delivered')).toBe('Livrée');
  });
});

describe('orderTimelineIndex', () => {
  it('returns index for active flow', () => {
    expect(orderTimelineIndex('confirmed')).toBe(0);
    expect(orderTimelineIndex('delivered')).toBe(3);
  });

  it('returns -1 for cancelled', () => {
    expect(orderTimelineIndex('cancelled')).toBe(-1);
  });
});
