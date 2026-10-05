import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionService, effectiveRole, homeFor } from './session.service';

describe('effectiveRole y homeFor', () => {
  it('aplica la precedencia ADMIN > PROFESSIONAL > USER', () => {
    expect(effectiveRole(['USER', 'ADMIN'])).toBe('ADMIN');
    expect(effectiveRole(['USER', 'PROFESSIONAL'])).toBe('PROFESSIONAL');
    expect(effectiveRole(['USER'])).toBe('USER');
    expect(effectiveRole([])).toBeNull();
  });

  it('lleva cada rol a su inicio y sin rol al login', () => {
    expect(homeFor('USER')).toBe('/paciente/inicio');
    expect(homeFor('PROFESSIONAL')).toBe('/profesional/mi-agenda');
    expect(homeFor('ADMIN')).toBe('/administrador/solicitudes');
    expect(homeFor(null)).toBe('/login');
  });
});

describe('SessionService', () => {
  let session: SessionService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    session = TestBed.inject(SessionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sin token no consulta /api/me', async () => {
    expect(await firstValueFrom(session.restore())).toBeNull();
    expect(session.role()).toBeNull();
  });

  it('restaura usuario y rol desde /api/me, no desde localStorage', async () => {
    localStorage.setItem('fcv.accessToken', 'token-de-prueba');
    localStorage.setItem('fcv.user', JSON.stringify({ roles: ['USER'] }));
    const restored = firstValueFrom(session.restore());
    http.expectOne((request) => request.url.endsWith('/api/me')).flush({ id: 1, name: 'Admin Laboratorio', email: 'admin@demo.invalid', roles: ['ADMIN'] });
    await restored;
    expect(session.role()).toBe('ADMIN');
    expect(session.home()).toBe('/administrador/solicitudes');
    expect(session.initials()).toBe('AL');
  });

  it('descarta la sesión si /api/me la rechaza', async () => {
    localStorage.setItem('fcv.accessToken', 'token-vencido');
    const restored = firstValueFrom(session.restore());
    http.expectOne((request) => request.url.endsWith('/api/me')).flush({ status: 401 }, { status: 401, statusText: 'Unauthorized' });
    expect(await restored).toBeNull();
    expect(session.user()).toBeNull();
    expect(localStorage.getItem('fcv.accessToken')).toBeNull();
  });
});
