import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authorityRouteAccess: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const connectedUser = authService.fetchUser().value;
  if (authService.isAuthenticated() && connectedUser) {
    const authorities = next.data['authorities'];
    return !authorities || authorities.length === 0 || authService.hasAnyAuthority(authorities);
  } else {
    authService.login();
    return false;
  }
};
