import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';

// Contrato oficial: citas-api/docs/wiki/llm-wiki/wiki/contratos-rest.md (D-21). El token lo agrega authInterceptor.
export interface CatalogItem { id: number; code: string; name: string; }
export interface EpsItem { id: number; code: string; name: string; active: boolean; }
export interface PlanItem { id: number; code: string; name: string; epsId: number; epsName: string; regimeId: number; regimeName: string; active: boolean; }
export interface PlanRequest { epsId: number; regimeId: number; code: string; name: string; active: boolean; }
export interface Specialty { id: number; name: string; durationMinutes: number; requiresAdminApproval: boolean; active: boolean; }
export interface Professional { id: number; name: string; professionalCode: string; active: boolean; }
export interface ProfessionalAdmin { id: number; name: string; email: string; professionalCode: string; licenseNumber: string; active: boolean; specialtyIds: number[]; primarySpecialtyId: number | null; locationIds: number[]; }
export interface ProfessionalRequest { firstName: string; lastName: string; documentType: string; documentNumber: string; email: string; phone: string; password: string; professionalCode: string; licenseNumber: string; }
export interface Block { id: number; locationId: number; locationName: string; date: string; startTime: string; endTime: string; slots: number; committedSlots: number; }
export interface BlockRequest { locationId: number; date: string; startTime: string; endTime: string; }
export interface Availability { professionalId: number; professionalName: string; locationId: number; specialtyId: number; date: string; startTime: string; durationMinutes: number; }
export interface RescheduleSummary { id: number; status: string; requestedDate: string; requestedStart: string; decisionReason?: string; patientAction?: string; }
export interface Appointment {
  id: number; status: string; patientName: string; professionalId: number; professionalName: string; locationId: number; locationName: string;
  specialtyId: number; specialtyName: string; requiresAdminApproval: boolean; date: string; startTime: string; endTime: string; durationMinutes: number;
  reason?: string; rejectionReason?: string; reschedule?: RescheduleSummary | null;
}
export interface RescheduleItem {
  id: number; appointmentId: number; status: string; patientName: string; professionalId: number; professionalName: string; specialtyId: number;
  specialtyName: string; locationId: number; locationName: string; previousDate: string; previousStart: string; requestedDate: string;
  requestedStart: string; durationMinutes: number; decisionReason?: string; patientAction?: string;
}
export interface HistoryItem { status: string; actorId?: number; actorName?: string; source: string; reason?: string; occurredAt: string; }
export interface Profile { id: number; name: string; firstName: string; lastName: string; email: string; documentType: string; documentNumber: string; phone: string; }
export interface Affiliation { id: number; epsId: number; epsName: string; planId: number; planName: string; regimeName: string; active: boolean; }
export interface InboxFilters { locationId?: number; professionalId?: number; specialtyId?: number; date?: string; }

@Injectable({ providedIn: 'root' })
export class SchedulingApiService {
  private readonly http = inject(HttpClient);
  private readonly api = `${inject(AuthService).apiUrl()}/api/v1`;

  // Catálogos públicos (HU-001)
  locations() { return this.http.get<CatalogItem[]>(`${this.api}/catalogs/locations`); }
  regimes() { return this.http.get<CatalogItem[]>(`${this.api}/catalogs/regimes`); }
  plans() { return this.http.get<PlanItem[]>(`${this.api}/catalogs/insurance-plans`); }
  specialties() { return this.http.get<Specialty[]>(`${this.api}/catalogs/specialties`); }
  catalogProfessionals(specialtyId?: number, locationId?: number) {
    return this.http.get<Professional[]>(`${this.api}/catalogs/professionals`, { params: params({ specialtyId, locationId }) });
  }

  // EPS y planes (HU-008)
  adminEps() { return this.http.get<EpsItem[]>(`${this.api}/admin/eps`); }
  createEps(body: Omit<EpsItem, 'id'>) { return this.http.post<EpsItem>(`${this.api}/admin/eps`, body); }
  updateEps(id: number, body: Omit<EpsItem, 'id'>) { return this.http.patch<EpsItem>(`${this.api}/admin/eps/${id}`, body); }
  deleteEps(id: number) { return this.http.delete<void>(`${this.api}/admin/eps/${id}`); }
  adminPlans() { return this.http.get<PlanItem[]>(`${this.api}/admin/plans`); }
  createPlan(body: PlanRequest) { return this.http.post<PlanItem>(`${this.api}/admin/plans`, body); }
  updatePlan(id: number, body: PlanRequest) { return this.http.patch<PlanItem>(`${this.api}/admin/plans/${id}`, body); }
  deletePlan(id: number) { return this.http.delete<void>(`${this.api}/admin/plans/${id}`); }

  // Especialidades (HU-009, HU-012)
  adminSpecialties() { return this.http.get<Specialty[]>(`${this.api}/admin/specialties`); }
  createSpecialty(body: Omit<Specialty, 'id'>) { return this.http.post<Specialty>(`${this.api}/admin/specialties`, body); }
  updateSpecialty(id: number, body: Omit<Specialty, 'id'>) { return this.http.patch<Specialty>(`${this.api}/admin/specialties/${id}`, body); }
  deleteSpecialty(id: number) { return this.http.delete<void>(`${this.api}/admin/specialties/${id}`); }

  // Profesionales (HU-010, HU-011)
  professionals() { return this.http.get<ProfessionalAdmin[]>(`${this.api}/admin/professionals`); }
  createProfessional(body: ProfessionalRequest) { return this.http.post<ProfessionalAdmin>(`${this.api}/admin/professionals`, body); }
  setAssignments(id: number, body: { specialtyIds: number[]; primarySpecialtyId: number; locationIds: number[] }) {
    return this.http.put<void>(`${this.api}/admin/professionals/${id}/assignments`, body);
  }
  setProfessionalActive(id: number, active: boolean) { return this.http.patch<void>(`${this.api}/admin/professionals/${id}/active`, null, { params: { active } }); }

  // Agenda del profesional (HU-013, HU-014, HU-023, HU-024)
  blocks(date?: string, locationId?: number) { return this.http.get<Block[]>(`${this.api}/professional/availability-blocks`, { params: params({ date, locationId }) }); }
  createBlock(body: BlockRequest) { return this.http.post<Block>(`${this.api}/professional/availability-blocks`, body); }
  updateBlock(id: number, body: BlockRequest) { return this.http.patch<Block>(`${this.api}/professional/availability-blocks/${id}`, body); }
  deleteBlock(id: number) { return this.http.delete<void>(`${this.api}/professional/availability-blocks/${id}`); }
  agenda(from?: string, to?: string, locationId?: number) {
    return this.http.get<Appointment[]>(`${this.api}/professional/appointments`, { params: params({ from, to, locationId }) });
  }
  close(id: number, status: 'COMPLETED' | 'NO_SHOW', reason?: string) {
    return this.http.post<Appointment>(`${this.api}/professional/appointments/${id}/close`, { status, reason });
  }

  // Paciente (HU-015 a HU-021)
  availability(locationId: number, specialtyId: number, date: string, professionalId?: number) {
    return this.http.get<Availability[]>(`${this.api}/availability`, { params: params({ locationId, specialtyId, date, professionalId }) });
  }
  book(body: { professionalId: number; locationId: number; specialtyId: number; date: string; startTime: string; reason?: string }) {
    return this.http.post<Appointment>(`${this.api}/appointments`, body);
  }
  mine(status?: string, from?: string, to?: string) { return this.http.get<Appointment[]>(`${this.api}/appointments`, { params: params({ status, from, to }) }); }
  cancelAppointment(id: number) { return this.http.post<void>(`${this.api}/appointments/${id}/cancel`, {}); }
  history(id: number) { return this.http.get<HistoryItem[]>(`${this.api}/appointments/${id}/history`); }
  requestReschedule(id: number, date: string, startTime: string) {
    return this.http.post<RescheduleItem>(`${this.api}/appointments/${id}/reschedule-requests`, { date, startTime });
  }
  keepAfterRejection(appointmentId: number, requestId: number) {
    return this.http.post<RescheduleItem>(`${this.api}/appointments/${appointmentId}/reschedule-requests/${requestId}/keep`, {});
  }

  // Bandejas ADMIN (HU-018, HU-022)
  requested(filters: InboxFilters = {}) { return this.http.get<Appointment[]>(`${this.api}/admin/appointments`, { params: params({ ...filters }) }); }
  decide(id: number, decision: 'APPROVE' | 'REJECT', reason?: string) {
    return this.http.post<Appointment>(`${this.api}/admin/appointments/${id}/decision`, { decision, reason });
  }
  pendingReschedules(filters: InboxFilters = {}) {
    return this.http.get<RescheduleItem[]>(`${this.api}/admin/reschedule-requests`, { params: params({ ...filters }) });
  }
  decideReschedule(id: number, decision: 'APPROVE' | 'REJECT', reason?: string) {
    return this.http.post<RescheduleItem>(`${this.api}/admin/reschedule-requests/${id}/decision`, { decision, reason });
  }

  // Perfil y afiliación (HU-006, HU-007)
  profile() { return this.http.get<Profile>(`${this.api}/users/me`); }
  updatePhone(phone: string) { return this.http.patch<Profile>(`${this.api}/users/me`, { phone }); }
  affiliation() { return this.http.get<Affiliation | null>(`${this.api}/users/me/affiliation`); }
  saveAffiliation(epsId: number, insurancePlanId: number) { return this.http.put<Affiliation>(`${this.api}/users/me/affiliation`, { epsId, insurancePlanId }); }
}

/** Solo envía los filtros con valor. */
function params(values: Record<string, string | number | boolean | undefined | null>): HttpParams {
  let result = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== '') result = result.set(key, String(value));
  }
  return result;
}
