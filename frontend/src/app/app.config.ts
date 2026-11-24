import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

function loadCurrentUser(auth: AuthService): () => Observable<unknown> {
  return () => {
    if (!auth.hasValidToken()) {
      auth.signOut();
      return of(null);
    }
    return auth.loadCurrentUser().pipe(
      map(() => null),
      catchError(() => of(null))
    );
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: loadCurrentUser,
      deps: [AuthService],
      multi: true
    }
  ]
};
