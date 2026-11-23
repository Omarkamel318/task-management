import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn & CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.hasValidToken()) {
    return true;
  }

  const hadToken = auth.token() !== null;
  auth.signOut();
  return inject(Router).createUrlTree(['/sign-in'], {
    queryParams: { returnUrl: state.url, expired: hadToken ? true : undefined }
  });
};
