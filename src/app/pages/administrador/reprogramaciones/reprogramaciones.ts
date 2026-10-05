import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogItem, ProfessionalAdmin, RescheduleItem, SchedulingApiService, Specialty } from '../../../services/scheduling-api.service';
import { BadgeService } from '../../../services/badge.service';
import { ReasonDialogComponent } from '../../../shared/reason-dialog';
import { apiMessage, formatDate, hhmm } from '../../../shared/format';

@Component({
  selector: 'app-reprogramaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReasonDialogComponent],
  template: `
    <section class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="fcv-eyebrow">Administración</p>
          <h1 class="fcv-title">Reprogramaciones pendientes</h1>
          <p class="text-sm text-outline mt-1">La cita original conserva su horario hasta tu decisión; la nueva franja está retenida.</p>
        </div>
        <button type="button" class="fcv-btn-primary" (click)="load()">Actualizar</button>
      </div>

      <form class="fcv-card grid gap-3 md:grid-cols-5 items-end" (ngSubmit)="load()" aria-label="Filtros de reprogramaciones">
        <label class="fcv-label">Sede
          <select class="fcv-input" name="location" [(ngModel)]="filters.locationId">
            <option [ngValue]="undefined">Todas las sedes</option>
            @for (l of locations(); track l.id) { <option [ngValue]="l.id">{{ l.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Profesional
          <select class="fcv-input" name="professional" [(ngModel)]="filters.professionalId">
            <option [ngValue]="undefined">Todos los profesionales</option>
            @for (p of professionals(); track p.id) { <option [ngValue]="p.id">{{ p.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Especialidad
          <select class="fcv-input" name="specialty" [(ngModel)]="filters.specialtyId">
            <option [ngValue]="undefined">Todas las especialidades</option>
            @for (s of specialties(); track s.id) { <option [ngValue]="s.id">{{ s.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Fecha propuesta <input class="fcv-input" type="date" name="date" [(ngModel)]="filters.date"></label>
        <button id="btn-filter-reschedules" class="fcv-btn-secondary">Filtrar</button>
      </form>

      @if (message()) {
        <p id="reschedules-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <div class="space-y-3">
        @for (item of items(); track item.id) {
          <article class="fcv-card flex flex-wrap items-center justify-between gap-4 reschedule-row" [attr.data-request-id]="item.id">
            <div class="space-y-1 text-sm">
              <p class="font-bold">{{ item.patientName }} · {{ item.specialtyName }}</p>
              <p class="text-on-surface-variant">{{ item.professionalName }} · {{ item.locationName }} · {{ item.durationMinutes }} min</p>
              <p>Actual: <strong>{{ date(item.previousDate) }} · {{ time(item.previousStart) }}</strong></p>
              <p>Propuesta: <strong class="text-primary">{{ date(item.requestedDate) }} · {{ time(item.requestedStart) }}</strong></p>
            </div>
            <div class="flex gap-2">
              <button type="button" class="fcv-btn-primary" (click)="approve(item)">Aprobar</button>
              <button type="button" class="fcv-btn-danger" (click)="rejecting.set(item)">Rechazar</button>
            </div>
          </article>
        } @empty {
          <p class="fcv-empty">No hay reprogramaciones pendientes para los filtros seleccionados.</p>
        }
      </div>

      <app-reason-dialog
        [open]="!!rejecting()"
        title="Rechazar reprogramación"
        description="Se libera solo la franja propuesta; la cita original se conserva y el paciente verá el motivo."
        confirmLabel="Rechazar reprogramación"
        (confirmed)="reject($event)"
        (dismissed)="rejecting.set(null)" />
    </section>
  `,
})
export class ReprogramacionesPage {
  private readonly api = inject(SchedulingApiService);
  private readonly badges = inject(BadgeService);
  readonly date = formatDate;
  readonly time = hhmm;
  readonly items = signal<RescheduleItem[]>([]);
  readonly locations = signal<CatalogItem[]>([]);
  readonly professionals = signal<ProfessionalAdmin[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly rejecting = signal<RescheduleItem | null>(null);
  readonly message = signal('');
  readonly error = signal(false);
  filters: { locationId?: number; professionalId?: number; specialtyId?: number; date?: string } = {};

  constructor() {
    this.api.locations().subscribe({ next: (x) => this.locations.set(x) });
    this.api.professionals().subscribe({ next: (x) => this.professionals.set(x) });
    this.api.adminSpecialties().subscribe({ next: (x) => this.specialties.set(x) });
    this.load();
  }

  load(): void {
    this.api.pendingReschedules({ ...this.filters, date: this.filters.date || undefined }).subscribe({
      next: (x) => this.items.set(x),
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar las reprogramaciones.'), true),
    });
  }

  approve(item: RescheduleItem): void {
    this.api.decideReschedule(item.id, 'APPROVE').subscribe({
      next: () => this.done(`Reprogramación aprobada: la cita de ${item.patientName} quedó el ${formatDate(item.requestedDate)} a las ${hhmm(item.requestedStart)}.`),
      error: (e) => this.show(apiMessage(e, 'No fue posible aprobar la reprogramación.'), true),
    });
  }

  reject(reason: string): void {
    const item = this.rejecting();
    if (!item) return;
    this.rejecting.set(null);
    this.api.decideReschedule(item.id, 'REJECT', reason).subscribe({
      next: () => this.done(`Reprogramación rechazada; ${item.patientName} conserva su cita original.`),
      error: (e) => this.show(apiMessage(e, 'No fue posible rechazar la reprogramación.'), true),
    });
  }

  private done(text: string): void {
    this.show(text);
    this.badges.refresh();
    this.load();
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
