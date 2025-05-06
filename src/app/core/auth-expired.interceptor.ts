import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthExpired: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => {
        if (err.status === 401 && err.url && !err.url.includes('api/auth') && authService.isAuthenticated()) {
          authService.login();
        }
      },
    })
  );
};
