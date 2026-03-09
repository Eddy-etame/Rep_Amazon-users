import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { AuthTokenService } from '../services/auth-token.service';
import { PowService } from '../services/pow.service';
import { sha256Hex } from '../utils/crypto';
import { buildFingerprint } from '../utils/fingerprint';
import { generateRequestId } from '../utils/request-id';

let clientFingerprintPromise: Promise<string> | null = null;
let gatewayFingerprintPromise: Promise<string> | null = null;

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const authTokenService = inject(AuthTokenService);
  const powService = inject(PowService);
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  return from(
    (async () => {
      const headers: Record<string, string> = {
        'X-Request-Id': generateRequestId()
      };

      if (!clientFingerprintPromise) {
        clientFingerprintPromise = buildFingerprint();
      }
      const clientFingerprint = await clientFingerprintPromise;
      headers['X-Client-Fingerprint'] = clientFingerprint;

      if (!gatewayFingerprintPromise) {
        gatewayFingerprintPromise = sha256Hex(`fp:${clientFingerprint}`);
      }
      const gatewayFingerprint = await gatewayFingerprintPromise;

      const token = authTokenService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (req.url.startsWith(apiBaseUrl)) {
        const proof = await powService.generateProof({
          method: req.method,
          url: req.urlWithParams,
          fingerprintHash: gatewayFingerprint
        });
        if (proof) {
          headers['X-PoW-Proof'] = proof.proof;
          headers['X-PoW-Nonce'] = proof.nonce;
          headers['X-PoW-Timestamp'] = String(proof.timestamp);
        }
      }

      return headers;
    })()
  ).pipe(
    switchMap((headers) => next(req.clone({ setHeaders: headers })))
  );
};
