import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserSessionStore } from '../services/user-session.store';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionStore = inject(UserSessionStore);
  const router = inject(Router);

  if (sessionStore.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/connexion'], {
    queryParams: { redirect: state.url }
  });
};

