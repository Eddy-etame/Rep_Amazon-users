import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ServiceJetonAuth } from '../services/service-jeton-auth';
import { DepotSessionUtilisateur } from '../services/depot-session-utilisateur';

export const gardeAuth: CanActivateFn = (route, state) => {
  const sessionStore = inject(DepotSessionUtilisateur);
  const authToken = inject(ServiceJetonAuth);
  const router = inject(Router);

  if (sessionStore.isLoggedIn() && authToken.getToken()) {
    return true;
  }

  authToken.clearToken();
  sessionStore.clear();

  return router.createUrlTree(['/connexion'], {
    queryParams: { redirect: state.url }
  });
};
