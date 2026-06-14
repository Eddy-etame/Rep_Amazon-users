import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { sha256Hex } from '../utils/crypto';

// Côté CLIENT de la preuve de travail (PoW). C'est ici qu'on "fait le travail" que la
// gateway vérifiera : on cherche un nonce tel que le hash de la requête commence par un
// certain nombre de zéros. Le serveur, lui, ne fait que recalculer une fois (cf.
// Amaz_back/shared/utils/pow.js).
//
// POINT CRUCIAL : la chaîne hachée ici doit être EXACTEMENT la même que côté serveur
// (`METHOD:path:timestamp:nonce:fingerprintHash`). Au moindre écart (chemin, empreinte…),
// la preuve sera rejetée. D'où l'attention portée à `normalizePath` et à l'empreinte.

export interface PowProofPayload {
  method: string;
  url: string;
  fingerprintHash: string;
}

export interface PowProofResult {
  proof: string;
  nonce: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class ServicePow {
  // Extrait le chemin + query d'une URL (doit correspondre au `req.originalUrl` vu côté serveur).
  private normalizePath(url: string): string {
    try {
      const parsed = new URL(url, window.location.origin);
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return url.startsWith('/') ? url : `/${url}`;
    }
  }

  // Graine aléatoire pour les nonces (tirage cryptographique du navigateur).
  private randomNonceSeed(): string {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Cherche une preuve valide. On incrémente le nonce jusqu'à obtenir un hash qui
  // commence par `difficulty` zéros. C'est ça, le "coût" pour le client.
  async generateProof(payload: PowProofPayload): Promise<PowProofResult | null> {
    const difficulty = environment.powDifficulty ?? 0;
    if (difficulty <= 0) {
      // Difficulté 0 = PoW désactivée (ex. environnement de dev) : rien à envoyer.
      return null;
    }

    const timestamp = Date.now();
    const method = payload.method.toUpperCase();
    const path = this.normalizePath(payload.url);
    const fingerprintHash = payload.fingerprintHash;
    const targetPrefix = '0'.repeat(difficulty);
    const seed = this.randomNonceSeed();
    const maxAttempts = 250_000; // garde-fou : on n'essaie pas à l'infini

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const nonce = `${seed}-${attempt}`;
      const candidate = `${method}:${path}:${timestamp}:${nonce}:${fingerprintHash}`;
      const hash = await sha256Hex(candidate);
      if (hash.startsWith(targetPrefix)) {
        // Trouvé : on renvoie le hash (la "preuve"), le nonce et l'horodatage.
        return {
          proof: hash,
          nonce,
          timestamp
        };
      }
    }

    return null;
  }
}
