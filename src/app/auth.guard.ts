import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FcvDataService } from './services/fcv-data.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.accessToken() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const fcv = inject(FcvDataService);
  const router = inject(Router);
  if (!auth.accessToken()) return router.createUrlTree(['/login']);
  return roles.includes(fcv.currentUser().role)
    ? true
    : router.createUrlTree([fcv.currentUser().role === 'ADMIN' ? '/administrador/solicitudes' : fcv.currentUser().role === 'PROFESSIONAL' ? '/profesional/mi-agenda' : '/paciente/inicio']);
};
