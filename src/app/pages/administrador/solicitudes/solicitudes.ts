import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment, CatalogItem, HistoryItem, ProfessionalAdmin, SchedulingApiService, Specialty } from '../../../services/scheduling-api.service';
import { BadgeService } from '../../../services/badge.service';
import { HistoryListComponent } from '../../../shared/history-list';
import { ReasonDialogComponent } from '../../../shared/reason-dialog';
import { apiMessage, formatDate, hhmm } from '../../../shared/format';

@Component({
  selector: 'app-admin-solicitudes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReasonDialogComponent, HistoryListComponent],
  template: `
    <section class="space-y-6">
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="fcv-eyebrow">Administración</p>
          <h1 class="fcv-title">Solicitudes especializadas</h1>
          <p class="text-sm text-outline mt-1">Citas en estado Solicitada que retienen su horario hasta tu decisión.</p>
        </div>
        <button type="button" class="fcv-btn-primary" (click)="load()">Actualizar</button>
      </div>

      <form class="fcv-card grid gap-3 md:grid-cols-5 items-end" (ngSubmit)="load()" aria-label="Filtros de solicitudes">
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
        <label class="fcv-label">Fecha <input class="fcv-input" type="date" name="date" [(ngModel)]="filters.date"></label>
        <button id="btn-filter-requests" class="fcv-btn-secondary">Filtrar</button>
      </form>

      @if (message()) {
        <p id="requests-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <div class="fcv-card p-0 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left bg-surface-container-low">
              <th class="p-3">Paciente</th><th class="p-3">Especialidad</th><th class="p-3">Profesional</th><th class="p-3">Sede</th>
              <th class="p-3">Fecha y hora</th><th class="p-3">Duración</th><th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of items(); track a.id) {
              <tr class="border-t border-outline-variant/20 align-top request-row" [attr.data-appointment-id]="a.id">
                <td class="p-3 font-semibold">{{ a.patientName }}
                  @if (a.reason) { <p class="text-xs font-normal text-outline mt-1">Motivo: {{ a.reason }}</p> }
                </td>
                <td class="p-3">{{ a.specialtyName }}</td>
                <td class="p-3">{{ a.professionalName }}</td>
                <td class="p-3">{{ a.locationName }}</td>
                <td class="p-3">{{ date(a.date) }} · {{ time(a.startTime) }}</td>
                <td class="p-3">{{ a.durationMinutes }} min</td>
                <td class="p-3">
                  <div class="flex flex-wrap gap-2">
                    <button type="button" class="fcv-btn-primary" (click)="approve(a)">Aprobar</button>
                    <button type="button" class="fcv-btn-danger" (click)="rejecting.set(a)">Rechazar</button>
                    <button type="button" class="fcv-btn-ghost" (click)="toggleHistory(a.id)">Historial</button>
                  </div>
                  @if (historyFor() === a.id) { <app-history-list [items]="history()" /> }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="p-6 text-center text-outline">No hay solicitudes pendientes para los filtros seleccionados.</td></tr>
            }
          </tbody>
        </table>
      </div>

      <app-reason-dialog
        [open]="!!rejecting()"
        title="Rechazar solicitud especializada"
        [description]="rejecting() ? rejecting()!.patientName + ' · ' + rejecting()!.specialtyName + ' · ' + date(rejecting()!.date) + ' ' + time(rejecting()!.startTime) : ''"
        confirmLabel="Rechazar y liberar horario"
        (confirmed)="reject($event)"
        (dismissed)="rejecting.set(null)" />
    </section>
  `,
})
export class AdminSolicitudesPage {
  private readonly api = inject(SchedulingApiService);
  private readonly badges = inject(BadgeService);
  readonly date = formatDate;
  readonly time = hhmm;
  readonly items = signal<Appointment[]>([]);
  readonly locations = signal<CatalogItem[]>([]);
  readonly professionals = signal<ProfessionalAdmin[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly rejecting = signal<Appointment | null>(null);
  readonly history = signal<HistoryItem[]>([]);
  readonly historyFor = signal<number | null>(null);
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
    this.api.requested({ ...this.filters, date: this.filters.date || undefined }).subscribe({
      next: (x) => this.items.set(x),
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar las solicitudes.'), true),
    });
  }

  approve(a: Appointment): void {
    this.api.decide(a.id, 'APPROVE').subscribe({
      next: () => this.done(`Solicitud de ${a.patientName} aprobada.`),
      error: (e) => this.show(apiMessage(e, 'No fue posible aprobar la solicitud.'), true),
    });
  }

  reject(reason: string): void {
    const a = this.rejecting();
    if (!a) return;
    this.rejecting.set(null);
    this.api.decide(a.id, 'REJECT', reason).subscribe({
      next: () => this.done(`Solicitud de ${a.patientName} rechazada; el horario quedó libre.`),
      error: (e) => this.show(apiMessage(e, 'No fue posible rechazar la solicitud.'), true),
    });
  }

  toggleHistory(id: number): void {
    if (this.historyFor() === id) {
      this.historyFor.set(null);
      return;
    }
    this.api.history(id).subscribe({ next: (items) => { this.history.set(items); this.historyFor.set(id); } });
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
