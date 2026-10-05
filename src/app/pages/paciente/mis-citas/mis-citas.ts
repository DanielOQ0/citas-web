import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment, Availability, HistoryItem, SchedulingApiService } from '../../../services/scheduling-api.service';
import { BadgeService } from '../../../services/badge.service';
import { HistoryListComponent } from '../../../shared/history-list';
import { STATUS_CLASS, STATUS_LABEL, apiMessage, formatDate, hhmm, isFuture, todayIso } from '../../../shared/format';

@Component({
  selector: 'app-mis-citas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, HistoryListComponent],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Portal Paciente</p>
        <h1 class="fcv-title">Mis citas</h1>
      </div>

      <form class="fcv-card flex flex-wrap items-end gap-3" (ngSubmit)="load()" aria-label="Filtros de mis citas">
        <label class="fcv-label">Estado
          <select class="fcv-input" name="status" [(ngModel)]="status">
            <option value="">Todos los estados</option>
            @for (code of statuses; track code) { <option [value]="code">{{ statusLabel[code] }}</option> }
          </select>
        </label>
        <label class="fcv-label">Desde <input class="fcv-input" type="date" name="from" [(ngModel)]="from"></label>
        <label class="fcv-label">Hasta <input class="fcv-input" type="date" name="to" [(ngModel)]="to"></label>
        <button id="btn-filter-mine" class="fcv-btn-primary">Filtrar</button>
      </form>

      @if (message()) {
        <p id="mine-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <div class="space-y-3">
        @for (a of items(); track a.id) {
          <article class="fcv-card appointment-card" [attr.data-appointment-id]="a.id">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-bold">{{ a.specialtyName }}</p>
                  <span class="fcv-chip" [class]="statusClass[a.status]">{{ statusLabel[a.status] }}</span>
                </div>
                <p class="text-sm">{{ date(a.date) }} · {{ time(a.startTime) }}–{{ time(a.endTime) }} · {{ a.durationMinutes }} min</p>
                <p class="text-sm text-on-surface-variant">{{ a.professionalName }} · {{ a.locationName }}</p>
                @if (a.reason) { <p class="text-xs text-outline">Motivo de la solicitud: {{ a.reason }}</p> }
                @if (a.status === 'REJECTED' && a.rejectionReason) {
                  <p class="text-sm text-error">Motivo de rechazo: {{ a.rejectionReason }}</p>
                }
              </div>
              <div class="flex flex-wrap gap-2">
                <button type="button" class="fcv-btn-ghost" (click)="toggleHistory(a.id)">{{ historyFor() === a.id ? 'Ocultar historial' : 'Historial' }}</button>
                @if (canReschedule(a)) {
                  <button type="button" class="fcv-btn-ghost" (click)="openReschedule(a)">Reprogramar</button>
                }
                @if (canCancel(a)) {
                  <button type="button" class="fcv-btn-danger-ghost" (click)="confirmCancel.set(a.id)">Cancelar</button>
                }
              </div>
            </div>

            @if (a.reschedule; as r) {
              <div class="mt-3 rounded-2xl bg-surface-container-low p-3 text-sm space-y-1 reschedule-info">
                @switch (r.status) {
                  @case ('PENDING') {
                    <p><strong>Reprogramación pendiente</strong> hacia {{ date(r.requestedDate) }} · {{ time(r.requestedStart) }}. Tu cita actual se conserva hasta la decisión.</p>
                  }
                  @case ('APPROVED') { <p><strong>Reprogramación aprobada.</strong> La cita quedó en el horario indicado arriba.</p> }
                  @case ('CANCELLED') { <p><strong>Reprogramación cancelada</strong> junto con la cita.</p> }
                  @case ('REJECTED') {
                    <p><strong>Reprogramación rechazada</strong> (propuesta: {{ date(r.requestedDate) }} · {{ time(r.requestedStart) }}).</p>
                    @if (r.decisionReason) { <p class="text-error">Motivo: {{ r.decisionReason }}</p> }
                    @if (r.patientAction === 'KEEP_APPOINTMENT') { <p class="text-outline">Decidiste conservar tu cita original.</p> }
                    @if (!r.patientAction && canCancel(a)) {
                      <div class="flex gap-2 pt-1">
                        <button type="button" class="fcv-btn-primary" (click)="keep(a.id, r.id)">Conservar mi cita</button>
                        <button type="button" class="fcv-btn-danger-ghost" (click)="confirmCancel.set(a.id)">Cancelar cita</button>
                      </div>
                    }
                  }
                }
              </div>
            }

            @if (confirmCancel() === a.id) {
              <div class="mt-3 rounded-2xl bg-error-container/60 p-3 flex flex-wrap items-center gap-3 text-sm" role="alert">
                <span>¿Confirmas cancelar esta cita? Se liberará el horario.</span>
                <button type="button" class="fcv-btn-danger" (click)="cancel(a.id)">Sí, cancelar</button>
                <button type="button" class="fcv-btn-ghost" (click)="confirmCancel.set(null)">No</button>
              </div>
            }

            @if (rescheduling()?.id === a.id) {
              <div class="mt-3 rounded-2xl border border-primary/30 p-4 space-y-3 reschedule-panel">
                <p class="text-sm font-semibold">Nueva fecha con {{ a.professionalName }} ({{ a.specialtyName }}, {{ a.locationName }})</p>
                <p class="text-xs text-outline">Cambiar de profesional es una cita nueva. Tu cita actual se conserva mientras la solicitud está pendiente.</p>
                <div class="flex flex-wrap items-end gap-2">
                  <label class="fcv-label">Fecha <input class="fcv-input" type="date" name="rescheduleDate" [min]="today" [(ngModel)]="rescheduleDate"></label>
                  <button type="button" class="fcv-btn-secondary" (click)="loadOptions(a)">Ver horarios</button>
                  <button type="button" class="fcv-btn-ghost" (click)="rescheduling.set(null)">Cerrar</button>
                </div>
                <div class="flex flex-wrap gap-2">
                  @for (option of options(); track option.startTime) {
                    <button type="button" class="fcv-btn-ghost reschedule-option" (click)="requestReschedule(a, option)">{{ time(option.startTime) }}</button>
                  } @empty {
                    @if (optionsLoaded()) { <p class="text-xs text-outline">Sin horarios disponibles ese día.</p> }
                  }
                </div>
              </div>
            }

            @if (historyFor() === a.id) {
              <app-history-list [items]="history()" />
            }
          </article>
        } @empty {
          <p class="fcv-empty">{{ loading() ? 'Cargando…' : 'No hay citas para los filtros seleccionados.' }}</p>
        }
      </div>
    </section>
  `,
})
export class MisCitasPage {
  private readonly api = inject(SchedulingApiService);
  private readonly badges = inject(BadgeService);
  readonly statusLabel = STATUS_LABEL;
  readonly statusClass = STATUS_CLASS;
  readonly statuses = ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];
  readonly date = formatDate;
  readonly time = hhmm;
  readonly today = todayIso();

  readonly items = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly history = signal<HistoryItem[]>([]);
  readonly historyFor = signal<number | null>(null);
  readonly confirmCancel = signal<number | null>(null);
  readonly rescheduling = signal<Appointment | null>(null);
  readonly options = signal<Availability[]>([]);
  readonly optionsLoaded = signal(false);
  readonly message = signal('');
  readonly error = signal(false);
  status = '';
  from = '';
  to = '';
  rescheduleDate = todayIso(1);

  constructor() {
    this.load();
  }

  load(): void {
    this.api.mine(this.status || undefined, this.from || undefined, this.to || undefined).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (e) => {
        this.loading.set(false);
        this.show(apiMessage(e, 'No fue posible cargar tus citas.'), true);
      },
    });
  }

  canCancel(a: Appointment): boolean {
    return (a.status === 'APPROVED' || a.status === 'REQUESTED') && isFuture(a.date, a.startTime);
  }

  canReschedule(a: Appointment): boolean {
    return a.status === 'APPROVED' && isFuture(a.date, a.startTime) && a.reschedule?.status !== 'PENDING';
  }

  toggleHistory(id: number): void {
    if (this.historyFor() === id) {
      this.historyFor.set(null);
      return;
    }
    this.api.history(id).subscribe({
      next: (items) => {
        this.history.set(items);
        this.historyFor.set(id);
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar el historial.'), true),
    });
  }

  cancel(id: number): void {
    this.confirmCancel.set(null);
    this.api.cancelAppointment(id).subscribe({
      next: () => {
        this.show('Cita cancelada. El horario quedó disponible.');
        this.badges.refresh();
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'La cita no se puede cancelar.'), true),
    });
  }

  keep(appointmentId: number, requestId: number): void {
    this.api.keepAfterRejection(appointmentId, requestId).subscribe({
      next: () => {
        this.show('Conservas tu cita en su horario original.');
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible registrar tu decisión.'), true),
    });
  }

  openReschedule(a: Appointment): void {
    this.rescheduling.set(a);
    this.options.set([]);
    this.optionsLoaded.set(false);
    this.rescheduleDate = todayIso(1);
  }

  loadOptions(a: Appointment): void {
    this.api.availability(a.locationId, a.specialtyId, this.rescheduleDate, a.professionalId).subscribe({
      next: (options) => {
        this.options.set(options);
        this.optionsLoaded.set(true);
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible consultar horarios.'), true),
    });
  }

  requestReschedule(a: Appointment, option: Availability): void {
    this.api.requestReschedule(a.id, option.date, hhmm(option.startTime)).subscribe({
      next: () => {
        this.rescheduling.set(null);
        this.show(`Reprogramación solicitada para el ${formatDate(option.date)} a las ${hhmm(option.startTime)}. Tu cita actual se conserva hasta la decisión.`);
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible solicitar la reprogramación.'), true),
    });
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
