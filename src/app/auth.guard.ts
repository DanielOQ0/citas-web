import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { UserRole } from './models/user-role';
import { SessionService } from './services/session.service';

/** El shell privado exige una sesión restaurada desde el backend. */
export const authGuard: CanActivateFn = () =>
  inject(SessionService).user() ? true : inject(Router).createUrlTree(['/login']);

/** Con sesión activa, el login devuelve al inicio del rol. */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  return session.user() ? inject(Router).parseUrl(session.home()) : true;
};

/** Cada grupo de rutas solo existe para su rol: sin coincidencia, tampoco se descarga su código. */
export const roleMatch = (role: UserRole): CanMatchFn => () => inject(SessionService).role() === role;
