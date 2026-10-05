import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {authInterceptor} from './services/auth.interceptor';
import {SessionService} from './services/session.service';

import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Restaura usuario y rol desde /api/me antes de la primera navegación (también tras F5).
    provideAppInitializer(() => firstValueFrom(inject(SessionService).restore())),
  ],
};
