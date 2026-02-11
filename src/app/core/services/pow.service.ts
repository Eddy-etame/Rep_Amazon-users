import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { sha256Hex } from '../utils/crypto';

@Injectable({ providedIn: 'root' })
export class PowService {
  async generateProof(payload: string): Promise<string | null> {
    const difficulty = environment.powDifficulty ?? 0;
    if (difficulty <= 0) {
      return null;
    }

    const targetPrefix = '0'.repeat(difficulty);
    let nonce = 0;
    const maxAttempts = 10_000;

    while (nonce < maxAttempts) {
      const candidate = `${payload}:${nonce}`;
      const hash = await sha256Hex(candidate);
      if (hash.startsWith(targetPrefix)) {
        return `${nonce}:${hash}`;
      }
      nonce += 1;
    }

    return null;
  }
}
