import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ServiceJetonAuth } from '../services/service-jeton-auth';
import { ServicePow } from '../services/service-pow';
import { sha256Hex } from '../utils/crypto';
import { buildFingerprint } from '../utils/empreinte';
import { generateRequestId } from '../utils/id-requete';

// Intercepteur HTTP : il s'intercale sur CHAQUE requête sortante et y ajoute les
// en-têtes de sécurité, pour qu'on n'ait pas à les remettre à la main partout.
//   - X-Request-Id : traçabilité ;
//   - X-Client-Fingerprint : empreinte de l'appareil ;
//   - Authorization: Bearer ... : si l'utilisateur est connecté ;
//   - X-PoW-* : la preuve de travail, uniquement pour les appels vers la gateway.

// On mémorise les empreintes (Promises) pour ne les calculer qu'une seule fois.
let clientFingerprintPromise: Promise<string> | null = null;
let gatewayFingerprintPromise: Promise<string> | null = null;

export const intercepteurEntetesSecurite: HttpInterceptorFn = (req, next) => {
  const authTokenService = inject(ServiceJetonAuth);
  const powService = inject(ServicePow);
  const apiBaseUrl = environment.apiBaseUrl.replace(/\/+$/, '');

  return from(
    (async () => {
      const headers: Record<string, string> = {
        'X-Request-Id': generateRequestId()
      };

      // Empreinte client (calculée une fois puis réutilisée).
      if (!clientFingerprintPromise) {
        clientFingerprintPromise = buildFingerprint();
      }
      const clientFingerprint = await clientFingerprintPromise;
      headers['X-Client-Fingerprint'] = clientFingerprint;

      // IMPORTANT : la gateway, quand elle reçoit X-Client-Fingerprint, calcule
      // sha256("fp:" + empreinte). On doit donc utiliser la MÊME valeur côté PoW,
      // sinon la preuve ne correspondra pas (voir Amaz_back/shared/utils/fingerprint.js).
      if (!gatewayFingerprintPromise) {
        gatewayFingerprintPromise = sha256Hex(`fp:${clientFingerprint}`);
      }
      const gatewayFingerprint = await gatewayFingerprintPromise;

      // Jeton d'accès si connecté.
      const token = authTokenService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // PoW seulement pour les appels qui partent vers la gateway (pas les assets locaux).
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
    // On attend la préparation async des en-têtes, puis on rejoue la requête clonée.
    switchMap((headers) => next(req.clone({ setHeaders: headers })))
  );
};
