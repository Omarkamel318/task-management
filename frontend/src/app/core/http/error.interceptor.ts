import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/toast/toast.service';
import { AuthService } from '../auth/auth.service';
import { toApiError } from './api-error';

const SIGN_IN_URL = `${environment.apiUrl}/auth/sign-in`;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((response: unknown) => {
      if (!(response instanceof HttpErrorResponse)) {
        return throwError(() => response);
      }

      const error = toApiError(response);

      if (error.status === 401 && req.url !== SIGN_IN_URL) {
        auth.signOut();
        const returnUrl = router.url.startsWith('/sign-in') ? undefined : router.url;
        router.navigate(['/sign-in'], { queryParams: { expired: true, returnUrl } });
      } else if (error.status === 403) {
        toast.show(error.detail ?? 'You cannot do this.', 'danger');
      } else if (error.status === 0) {
        toast.show('No connection to the server. Check your network, then try again.', 'danger');
      } else if (error.status >= 500) {
        toast.show('Something went wrong on the server. Try again later.', 'danger');
      }

      return throwError(() => error);
    })
  );
};
