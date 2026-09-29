import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface CatalogItem { id: number; code: string; name: string; }
export interface PlanItem { id: number; name: string; epsName: string; active: boolean; }
export interface EpsItem { id: number; code: string; name: string; active: boolean; }
export interface PlanAdminRequest { epsId: number; regimeId: number; code: string; name: string; active: boolean; }
export interface Affiliation { id: number; planId: number; planName: string; epsName: string; regimeName: string; active: boolean; }
export interface Profile { id: number; name: string; email: string; phone: string; }
export interface Specialty { id: number; name: string; durationMinutes: number; active: boolean; }
export interface Professional { id: number; name: string; professionalCode: string; active: boolean; }
export interface Availability { professionalId: number; locationId: number; specialtyId: number; date: string; startTime: string; durationMinutes: number; }
export interface Appointment { id: number; status: string; professionalId: number; locationId: number; specialtyId: number; date: string; startTime: string; durationMinutes: number; rejectionReason?: string; }

@Injectable({ providedIn: 'root' })
export class SchedulingApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = this.auth.apiUrl();
  private headers(): HttpHeaders { const token = this.auth.accessToken(); return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders(); }
  locations() { return this.http.get<CatalogItem[]>(`${this.api}/api/v1/catalogs/locations`); }
  plans() { return this.http.get<PlanItem[]>(`${this.api}/api/v1/catalogs/insurance-plans`); }
  adminEps() { return this.http.get<EpsItem[]>(`${this.api}/api/v1/admin/eps`, { headers: this.headers() }); }
  createEps(body: Omit<EpsItem, 'id'>) { return this.http.post<EpsItem>(`${this.api}/api/v1/admin/eps`, body, { headers: this.headers() }); }
  updateEps(id: number, body: Omit<EpsItem, 'id'>) { return this.http.patch<EpsItem>(`${this.api}/api/v1/admin/eps/${id}`, body, { headers: this.headers() }); }
  adminPlans() { return this.http.get<PlanItem[]>(`${this.api}/api/v1/admin/plans`, { headers: this.headers() }); }
  createPlan(body: PlanAdminRequest) { return this.http.post<PlanItem>(`${this.api}/api/v1/admin/plans`, body, { headers: this.headers() }); }
  updatePlan(id: number, body: PlanAdminRequest) { return this.http.patch<PlanItem>(`${this.api}/api/v1/admin/plans/${id}`, body, { headers: this.headers() }); }
  affiliation() { return this.http.get<Affiliation | null>(`${this.api}/api/v1/users/me/affiliation`, { headers: this.headers() }); }
  saveAffiliation(insurancePlanId: number) { return this.http.put<Affiliation>(`${this.api}/api/v1/users/me/affiliation`, { insurancePlanId }, { headers: this.headers() }); }
  profile() { return this.http.get<Profile>(`${this.api}/api/v1/users/me`, { headers: this.headers() }); }
  updatePhone(phone: string) { return this.http.patch<Profile>(`${this.api}/api/v1/users/me`, { phone }, { headers: this.headers() }); }
  specialties() { return this.http.get<Specialty[]>(`${this.api}/api/v1/catalogs/specialties`); }
  adminSpecialties() { return this.http.get<Specialty[]>(`${this.api}/api/v1/admin/specialties`, { headers: this.headers() }); }
  createSpecialty(body: Omit<Specialty, 'id'>) { return this.http.post<Specialty>(`${this.api}/api/v1/admin/specialties`, body, { headers: this.headers() }); }
  professionals() { return this.http.get<Professional[]>(`${this.api}/api/v1/admin/professionals`, { headers: this.headers() }); }
  createProfessional(body: unknown) { return this.http.post<Professional>(`${this.api}/api/v1/admin/professionals`, body, { headers: this.headers() }); }
  setAssignments(id: number, body: { specialtyIds: number[]; primarySpecialtyId: number; locationIds: number[] }) { return this.http.put<void>(`${this.api}/api/v1/admin/professionals/${id}/assignments`, body, { headers: this.headers() }); }
  setProfessionalActive(id: number, active: boolean) { return this.http.patch<void>(`${this.api}/api/v1/admin/professionals/${id}/active`, null, { headers: this.headers(), params: { active } }); }
  blocks() { return this.http.get<unknown[]>(`${this.api}/api/v1/professional/availability-blocks`, { headers: this.headers() }); }
  createBlock(body: { locationId: number; date: string; startTime: string; endTime: string }) { return this.http.post(`${this.api}/api/v1/professional/availability-blocks`, body, { headers: this.headers() }); }
  availability(locationId: number, specialtyId: number, date: string, professionalId?: number) { let params = new HttpParams().set('locationId', locationId).set('specialtyId', specialtyId).set('date', date); if (professionalId) params = params.set('professionalId', professionalId); return this.http.get<Availability[]>(`${this.api}/api/v1/availability`, { params }); }
  book(body: { professionalId: number; locationId: number; specialtyId: number; date: string; startTime: string; reason?: string }) { return this.http.post<Appointment>(`${this.api}/api/v1/appointments`, body, { headers: this.headers() }); }
  requested() { return this.http.get<Appointment[]>(`${this.api}/api/v1/admin/appointments`, { headers: this.headers() }); }
  decide(id: number, decision: 'APPROVE' | 'REJECT', reason?: string) { return this.http.post<Appointment>(`${this.api}/api/v1/admin/appointments/${id}/decision`, { decision, reason }, { headers: this.headers() }); }
  mine(status?: string, from?: string, to?: string) { let params = new HttpParams(); if (status) params=params.set('status',status); if (from) params=params.set('from',from); if (to) params=params.set('to',to); return this.http.get<Appointment[]>(`${this.api}/api/v1/appointments`, { headers: this.headers(), params }); }
  cancelAppointment(id: number) { return this.http.post<void>(`${this.api}/api/v1/appointments/${id}/cancel`, {}, { headers: this.headers() }); }
  requestReschedule(id: number, date: string, startTime: string, reason?: string) { return this.http.post(`${this.api}/api/v1/appointments/${id}/reschedule-requests`, { date, startTime, reason }, { headers: this.headers() }); }
  pendingReschedules() { return this.http.get<unknown[]>(`${this.api}/api/v1/admin/reschedule-requests`, { headers: this.headers() }); }
  decideReschedule(id: number, decision: 'APPROVE'|'REJECT', reason?: string) { return this.http.post(`${this.api}/api/v1/admin/reschedule-requests/${id}/decision`, { decision, reason }, { headers: this.headers() }); }
}
