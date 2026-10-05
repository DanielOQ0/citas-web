import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Availability, CatalogItem, Professional, SchedulingApiService, Specialty } from '../../../services/scheduling-api.service';
import { BadgeService } from '../../../services/badge.service';
import { apiMessage, formatDate, hhmm, todayIso } from '../../../shared/format';

type Kind = '' | 'general' | 'specialized';

@Component({
  selector: 'app-buscar-disponibilidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Portal Paciente</p>
        <h1 class="fcv-title">Buscar disponibilidad</h1>
        <p class="text-sm text-outline mt-1">Las citas de Medicina General se aprueban automáticamente; las especializadas quedan pendientes y retienen el horario hasta la decisión administrativa.</p>
      </div>

      <form class="fcv-card grid gap-4 md:grid-cols-3 lg:grid-cols-6" (ngSubmit)="search()" aria-label="Filtros de disponibilidad">
        <label class="fcv-label lg:col-span-2">Sede
          <select class="fcv-input" name="location" [(ngModel)]="locationId" (ngModelChange)="loadProfessionals()">
            <option [ngValue]="0">Seleccione</option>
            @for (location of locations(); track location.id) { <option [ngValue]="location.id">{{ location.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Tipo de cita
          <select class="fcv-input" name="kind" [ngModel]="kind()" (ngModelChange)="setKind($event)">
            <option value="">Todas</option>
            <option value="general">General</option>
            <option value="specialized">Especializada</option>
          </select>
        </label>
        <label class="fcv-label">Especialidad
          <select class="fcv-input" name="specialty" [(ngModel)]="specialtyId" (ngModelChange)="loadProfessionals()">
            <option [ngValue]="0">Seleccione</option>
            @for (specialty of visibleSpecialties(); track specialty.id) { <option [ngValue]="specialty.id">{{ specialty.name }} · {{ specialty.durationMinutes }} min</option> }
          </select>
        </label>
        <label class="fcv-label">Profesional
          <select class="fcv-input" name="professional" [(ngModel)]="professionalId">
            <option [ngValue]="undefined">Cualquiera</option>
            @for (professional of professionals(); track professional.id) { <option [ngValue]="professional.id">{{ professional.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Fecha
          <input class="fcv-input" type="date" name="date" [min]="today" [(ngModel)]="date">
        </label>
        <div class="md:col-span-3 lg:col-span-6 flex justify-end">
          <button id="btn-search" class="fcv-btn-primary">Buscar horarios</button>
        </div>
      </form>

      @if (message()) {
        <p id="search-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">
          {{ message() }} @if (!error()) { <a routerLink="/paciente/mis-citas" class="underline font-semibold">Ver mis citas</a> }
        </p>
      }

      @if (selected(); as slot) {
        <section class="fcv-card border-primary/40 space-y-3" aria-labelledby="confirm-title">
          <h2 id="confirm-title" class="font-bold">Confirmar {{ selectedSpecialty()?.requiresAdminApproval ? 'solicitud especializada' : 'cita general' }}</h2>
          <p class="text-sm">{{ selectedSpecialty()?.name }} con <strong>{{ slot.professionalName }}</strong></p>
          <p class="text-sm text-outline">{{ date_(slot.date) }} · {{ time(slot.startTime) }} · {{ slot.durationMinutes }} min · {{ locationName(slot.locationId) }}</p>
          @if (selectedSpecialty()?.requiresAdminApproval) {
            <label class="fcv-label">Motivo de la consulta (opcional)
              <textarea class="fcv-input" name="reason" rows="2" maxlength="500" [(ngModel)]="reason"></textarea>
            </label>
          }
          <div class="flex gap-2">
            <button id="btn-confirm-booking" type="button" class="fcv-btn-primary" [disabled]="busy()" (click)="book(slot)">Confirmar</button>
            <button type="button" class="fcv-btn-ghost" (click)="selected.set(null)">Volver</button>
          </div>
        </section>
      }

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        @for (slot of slots(); track slot.professionalId + '-' + slot.startTime) {
          <article class="fcv-card slot-card">
            <p class="font-bold">{{ slot.professionalName }}</p>
            <p class="text-sm text-outline">{{ date_(slot.date) }} · {{ time(slot.startTime) }} · {{ slot.durationMinutes }} min</p>
            <p class="text-xs text-on-surface-variant mt-1">{{ selectedSpecialty()?.name }} · {{ locationName(slot.locationId) }}</p>
            <button type="button" class="fcv-btn-primary mt-4" (click)="choose(slot)">Seleccionar {{ time(slot.startTime) }}</button>
          </article>
        } @empty {
          <p class="fcv-empty md:col-span-2">{{ searched() ? 'No hay horarios disponibles para esa combinación. Prueba otra sede, profesional o fecha.' : 'Selecciona sede, especialidad y fecha para ver horarios disponibles.' }}</p>
        }
      </div>
    </section>
  `,
})
export class BuscarDisponibilidadPage {
  private readonly api = inject(SchedulingApiService);
  private readonly badges = inject(BadgeService);
  readonly date_ = formatDate;
  readonly time = hhmm;
  readonly today = todayIso();

  readonly locations = signal<CatalogItem[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly professionals = signal<Professional[]>([]);
  readonly slots = signal<Availability[]>([]);
  readonly kind = signal<Kind>('');
  readonly selected = signal<Availability | null>(null);
  readonly searched = signal(false);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly error = signal(false);
  readonly visibleSpecialties = computed(() =>
    this.specialties().filter((s) => this.kind() === '' || (this.kind() === 'specialized') === s.requiresAdminApproval),
  );

  locationId = 0;
  specialtyId = 0;
  professionalId: number | undefined;
  date = todayIso(1);
  reason = '';

  constructor() {
    this.api.locations().subscribe({ next: (x) => this.locations.set(x), error: (e) => this.fail(apiMessage(e, 'No fue posible cargar las sedes.')) });
    this.api.specialties().subscribe({ next: (x) => this.specialties.set(x), error: (e) => this.fail(apiMessage(e, 'No fue posible cargar las especialidades.')) });
  }

  selectedSpecialty(): Specialty | undefined {
    return this.specialties().find((s) => s.id === this.specialtyId);
  }

  locationName(id: number): string {
    return this.locations().find((l) => l.id === id)?.name ?? '';
  }

  setKind(kind: Kind): void {
    this.kind.set(kind);
    if (!this.visibleSpecialties().some((s) => s.id === this.specialtyId)) this.specialtyId = 0;
    this.loadProfessionals();
  }

  /** El selector de profesional solo ofrece quienes atienden la especialidad en la sede elegida. */
  loadProfessionals(): void {
    this.professionalId = undefined;
    if (!this.specialtyId) {
      this.professionals.set([]);
      return;
    }
    this.api.catalogProfessionals(this.specialtyId, this.locationId || undefined).subscribe({ next: (x) => this.professionals.set(x) });
  }

  search(keepMessage = false): void {
    this.selected.set(null);
    if (!this.locationId || !this.specialtyId || !this.date) return this.fail('Selecciona sede, especialidad y fecha.');
    if (!keepMessage) this.message.set('');
    this.searched.set(true);
    this.api.availability(this.locationId, this.specialtyId, this.date, this.professionalId).subscribe({
      next: (x) => this.slots.set(x),
      error: (e) => this.fail(apiMessage(e, 'No fue posible consultar la disponibilidad.')),
    });
  }

  choose(slot: Availability): void {
    this.selected.set(slot);
    this.message.set('');
  }

  book(slot: Availability): void {
    this.busy.set(true);
    this.api.book({
      professionalId: slot.professionalId,
      locationId: slot.locationId,
      specialtyId: slot.specialtyId,
      date: slot.date,
      startTime: hhmm(slot.startTime),
      reason: this.reason.trim() || undefined,
    }).subscribe({
      next: (appointment) => {
        this.busy.set(false);
        this.reason = '';
        this.message.set(appointment.status === 'APPROVED'
          ? `Cita general aprobada para el ${formatDate(appointment.date)} a las ${hhmm(appointment.startTime)}.`
          : `Solicitud especializada registrada y pendiente de aprobación (${formatDate(appointment.date)}, ${hhmm(appointment.startTime)}).`);
        this.error.set(false);
        this.badges.refresh();
        this.search(true);
      },
      error: (e) => {
        this.busy.set(false);
        this.fail(apiMessage(e, 'No fue posible reservar la cita.'));
        if (e.status === 409) this.search(true);
      },
    });
  }

  private fail(text: string): void {
    this.message.set(text);
    this.error.set(true);
  }
}
