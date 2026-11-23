import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  if (inject(AuthService).hasValidToken()) {
    return inject(Router).createUrlTree(['/']);
  }
  return true;
};
