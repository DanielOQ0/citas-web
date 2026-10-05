import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';
import { AuthService, AuthUser } from './auth.service';
import { UserRole } from '../models/user-role';

const ROLE_PRECEDENCE: readonly UserRole[] = ['ADMIN', 'PROFESSIONAL', 'USER'];

const HOME: Record<UserRole, string> = {
  USER: '/paciente/inicio',
  PROFESSIONAL: '/profesional/mi-agenda',
  ADMIN: '/administrador/solicitudes',
};

const TITLE: Record<UserRole, string> = {
  USER: 'Paciente',
  PROFESSIONAL: 'Profesional',
  ADMIN: 'Administrador',
};

/** Rol con el que trabaja la sesión; si una cuenta tuviera varios, prevalece ADMIN > PROFESSIONAL > USER (D-23). */
export function effectiveRole(roles: readonly string[]): UserRole | null {
  return ROLE_PRECEDENCE.find((role) => roles.includes(role)) ?? null;
}

export function homeFor(role: UserRole | null): string {
  return role ? HOME[role] : '/login';
}

/** Única fuente del usuario autenticado: login, registro o GET /api/me. No existe cambio manual de vista. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly role = computed(() => effectiveRole(this.user()?.roles ?? []));
  readonly roleTitle = computed(() => {
    const role = this.role();
    return role ? TITLE[role] : '';
  });
  readonly initials = computed(() =>
    (this.user()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );

  /** Al arrancar (también tras F5) el rol se pide al backend; nunca se lee de localStorage. */
  restore(): Observable<AuthUser | null> {
    if (!this.auth.accessToken()) return of(null);
    return this.http.get<AuthUser>(`${this.auth.apiUrl()}/api/me`).pipe(
      tap((user) => this.user.set(user)),
      catchError(() => {
        this.clear();
        return of(null);
      }),
    );
  }

  start(user: AuthUser): void {
    this.user.set(user);
  }

  home(): string {
    return homeFor(this.role());
  }

  logout(): void {
    const finish = () => {
      this.clear();
      this.router.navigateByUrl('/login');
    };
    this.auth.logout().subscribe({ next: finish, error: finish });
  }

  clear(): void {
    this.auth.clear();
    this.user.set(null);
  }

  /** Refresh vencido o revocado: se cierra la sesión local y se vuelve al login. */
  expire(): void {
    this.clear();
    if (this.router.navigated) this.router.navigateByUrl('/login');
  }
}
