import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthTokenService } from '../services/auth-token.service';
import { PowService } from '../services/pow.service';
import { buildFingerprint } from '../utils/fingerprint';
import { generateRequestId } from '../utils/request-id';

const POW_PATHS = ['/auth/login', '/auth/register', '/auth/reset'];
let fingerprintPromise: Promise<string> | null = null;

export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  const authTokenService = inject(AuthTokenService);
  const powService = inject(PowService);

  return from(
    (async () => {
      const headers: Record<string, string> = {
        'X-Request-Id': generateRequestId()
      };

      if (!fingerprintPromise) {
        fingerprintPromise = buildFingerprint();
      }
      headers['X-Client-Fingerprint'] = await fingerprintPromise;

      const token = authTokenService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (POW_PATHS.some((path) => req.url.includes(path))) {
        const proof = await powService.generateProof(req.url);
        if (proof) {
          headers['X-PoW-Proof'] = proof;
        }
      }

      return headers;
    })()
  ).pipe(
    switchMap((headers) => next(req.clone({ setHeaders: headers })))
  );
};
