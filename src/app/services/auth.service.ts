import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UserRole } from '../models/fcv.models';

export interface AuthUser { id: number; name: string; email: string; roles: UserRole[]; }
export interface TokenResponse { accessToken: string; refreshToken: string; expiresIn: number; user: AuthUser; }
export interface LoginRequest { email: string; password: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiUrl = this.read('fcv_api_url') || 'http://localhost:8080';
  private readonly accessKey = 'fcv.accessToken';
  private readonly refreshKey = 'fcv.refreshToken';

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/api/auth/login`, request).pipe(tap((response) => this.store(response)));
  }
  refresh(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/api/auth/refresh`, { refreshToken: this.refreshToken() }).pipe(tap((response) => this.store(response)));
  }
  logout(): Observable<void> {
    const token = this.refreshToken();
    return this.http.post<void>(`${this.apiUrl}/api/auth/logout`, { refreshToken: token }).pipe(tap(() => this.clear()));
  }
  accessToken(): string { return this.read(this.accessKey); }
  refreshToken(): string { return this.read(this.refreshKey); }
  clear(): void { if (isPlatformBrowser(this.platformId)) { localStorage.removeItem(this.accessKey); localStorage.removeItem(this.refreshKey); } }
  private store(response: TokenResponse): void { if (isPlatformBrowser(this.platformId)) { localStorage.setItem(this.accessKey, response.accessToken); localStorage.setItem(this.refreshKey, response.refreshToken); localStorage.setItem('fcv.user', JSON.stringify(response.user)); } }
  private read(key: string): string { return isPlatformBrowser(this.platformId) ? localStorage.getItem(key) || '' : ''; }
}
