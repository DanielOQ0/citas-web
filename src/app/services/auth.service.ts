import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap, throwError } from 'rxjs';
import { UserRole } from '../models/fcv.models';

export interface AuthUser { id: number; name: string; email: string; roles: UserRole[]; }
export interface TokenResponse { accessToken: string; refreshToken: string; expiresIn: number; user: AuthUser; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; password: string; insurancePlanId?: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrlValue = this.read('fcv_api_url') || 'http://localhost:8080';
  private readonly accessKey = 'fcv.accessToken';
  private readonly refreshKey = 'fcv.refreshToken';
  private refreshInFlight?: Observable<TokenResponse>;

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrlValue}/api/auth/login`, request).pipe(tap((response) => this.store(response)));
  }
  register(request: RegisterRequest): Observable<TokenResponse> { return this.http.post<TokenResponse>(`${this.apiUrlValue}/api/auth/register`, request).pipe(tap((response) => this.store(response))); }
  refresh(): Observable<TokenResponse> {
    const token = this.refreshToken();
    if (!token) return throwError(() => new Error('No hay refresh token disponible'));
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.http.post<TokenResponse>(`${this.apiUrlValue}/api/auth/refresh`, { refreshToken: token }).pipe(
      tap((response) => this.store(response)),
      finalize(() => { this.refreshInFlight = undefined; }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.refreshInFlight;
  }
  logout(): Observable<void> {
    const token = this.refreshToken();
    return this.http.post<void>(`${this.apiUrlValue}/api/auth/logout`, { refreshToken: token }).pipe(tap(() => this.clear()));
  }
  requestPasswordRecovery(email: string): Observable<{ accepted: boolean; developmentToken?: string }> { return this.http.post<{ accepted: boolean; developmentToken?: string }>(`${this.apiUrlValue}/api/auth/password-recovery`, { email }); }
  resetPassword(token: string, password: string): Observable<void> { return this.http.post<void>(`${this.apiUrlValue}/api/auth/password-reset`, { token, password }); }
  accessToken(): string { return this.read(this.accessKey); }
  apiUrl(): string { return this.apiUrlValue; }
  refreshToken(): string { return this.read(this.refreshKey); }
  clear(): void { if (isPlatformBrowser(this.platformId)) { localStorage.removeItem(this.accessKey); localStorage.removeItem(this.refreshKey); localStorage.removeItem('fcv.user'); } }
  private store(response: TokenResponse): void { if (isPlatformBrowser(this.platformId)) { localStorage.setItem(this.accessKey, response.accessToken); localStorage.setItem(this.refreshKey, response.refreshToken); localStorage.setItem('fcv.user', JSON.stringify(response.user)); } }
  private read(key: string): string { return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) || '' : ''; }
}
