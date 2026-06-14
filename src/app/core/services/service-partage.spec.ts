import { describe, expect, it } from 'vitest';

import { ServicePartage } from './service-partage';

describe('ServicePartage.absoluteUrl', () => {
  it('keeps absolute http URLs', () => {
    const s = new ServicePartage();
    expect(s.absoluteUrl('https://example.com/p')).toBe('https://example.com/p');
  });

  it('prefixes path with slash when no window', () => {
    const s = new ServicePartage();
    const u = s.absoluteUrl('/liste/token123');
    expect(u).toBe('/liste/token123');
  });
});
