import { describe, expect, it } from 'vitest';

import { ShareService } from './share.service';

describe('ShareService.absoluteUrl', () => {
  it('keeps absolute http URLs', () => {
    const s = new ShareService();
    expect(s.absoluteUrl('https://example.com/p')).toBe('https://example.com/p');
  });

  it('prefixes path with slash when no window', () => {
    const s = new ShareService();
    const u = s.absoluteUrl('/liste/token123');
    expect(u).toBe('/liste/token123');
  });
});
