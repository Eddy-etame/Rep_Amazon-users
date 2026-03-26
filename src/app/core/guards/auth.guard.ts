import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthTokenService } from '../services/auth-token.service';
import { UserSessionStore } from '../services/user-session.store';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionStore = inject(UserSessionStore);
  const authToken = inject(AuthTokenService);
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

