import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Route, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard, roleMatch } from './auth.guard';
import { SessionService } from './services/session.service';
import { UserRole } from './models/user-role';

describe('guards de rol', () => {
  let session: SessionService;

  const signIn = (roles: UserRole[]) => session.start({ id: 7, name: 'Prueba Rol', email: 'rol@demo.invalid', roles });
  const run = <T>(guard: () => T) => TestBed.runInInjectionContext(guard);

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
    session = TestBed.inject(SessionService);
  });

  it('cada grupo de rutas solo coincide con su rol', () => {
    signIn(['ADMIN']);
    expect(run(() => roleMatch('ADMIN')({} as Route, []))).toBe(true);
    expect(run(() => roleMatch('USER')({} as Route, []))).toBe(false);
    expect(run(() => roleMatch('PROFESSIONAL')({} as Route, []))).toBe(false);
  });

  it('sin sesión ningún rol coincide y el shell redirige al login', () => {
    expect(run(() => roleMatch('USER')({} as Route, []))).toBe(false);
    const result = run(() => authGuard({} as never, {} as never)) as UrlTree;
    expect(result.toString()).toBe('/login');
  });

  it('con sesión, el login devuelve al inicio del rol', () => {
    signIn(['PROFESSIONAL']);
    const result = run(() => guestGuard({} as never, {} as never)) as UrlTree;
    expect(result.toString()).toBe('/profesional/mi-agenda');
  });
});
