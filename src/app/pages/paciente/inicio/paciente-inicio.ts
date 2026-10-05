import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment, SchedulingApiService } from '../../../services/scheduling-api.service';
import { BadgeService } from '../../../services/badge.service';
import { SessionService } from '../../../services/session.service';
import { STATUS_CLASS, STATUS_LABEL, apiMessage, formatDate, hhmm, isFuture } from '../../../shared/format';

@Component({
  selector: 'app-paciente-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Portal Paciente</p>
        <h1 class="fcv-title">Hola, {{ session.user()?.name }}</h1>
        <p class="text-sm text-outline mt-1">Resumen de tus citas próximas y solicitudes en trámite.</p>
      </div>

      <div class="rounded-3xl bg-primary text-on-primary p-6 sm:p-8">
        <h2 class="text-xl sm:text-2xl font-bold">¿Necesitas una nueva valoración médica?</h2>
        <p class="text-sm opacity-80 mt-2 mb-5">Consulta horarios disponibles por sede, tipo de cita, especialidad y profesional.</p>
        <a routerLink="/paciente/buscar-disponibilidad" class="inline-flex px-5 py-3 rounded-xl bg-surface-container-lowest text-primary font-semibold text-sm">Solicitar cita médica</a>
      </div>

      @if (error()) {
        <p class="fcv-alert-error" role="alert">{{ error() }}</p>
      }

      @if (next(); as appointment) {
        <section class="fcv-card" aria-labelledby="next-title">
          <div class="flex items-center justify-between gap-3 mb-3">
            <h2 id="next-title" class="font-bold">Próxima cita</h2>
            <span class="fcv-chip" [class]="statusClass[appointment.status]">{{ statusLabel[appointment.status] }}</span>
          </div>
          <p class="font-semibold">{{ appointment.specialtyName }} · {{ appointment.professionalName }}</p>
          <p class="text-sm text-outline">{{ date(appointment.date) }} · {{ time(appointment.startTime) }}–{{ time(appointment.endTime) }} · {{ appointment.durationMinutes }} min</p>
          <p class="text-sm">{{ appointment.locationName }}</p>
          <a routerLink="/paciente/mis-citas" class="fcv-btn-ghost mt-4">Gestionar en Mis citas</a>
        </section>
      }

      <section aria-labelledby="upcoming-title">
        <div class="flex items-center justify-between mb-3">
          <h2 id="upcoming-title" class="font-bold">Citas próximas y en trámite</h2>
          <a routerLink="/paciente/mis-citas" class="text-xs text-primary font-semibold">Ver historial completo</a>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          @for (appointment of upcoming(); track appointment.id) {
            <article class="fcv-card">
              <div class="flex justify-between gap-2">
                <p class="font-bold">{{ appointment.specialtyName }}</p>
                <span class="fcv-chip" [class]="statusClass[appointment.status]">{{ statusLabel[appointment.status] }}</span>
              </div>
              <p class="text-sm text-outline">{{ date(appointment.date) }} · {{ time(appointment.startTime) }} · {{ appointment.durationMinutes }} min</p>
              <p class="text-sm">{{ appointment.professionalName }} · {{ appointment.locationName }}</p>
            </article>
          } @empty {
            <p class="fcv-empty">{{ loading() ? 'Cargando tus citas…' : 'No tienes citas próximas ni solicitudes en trámite.' }}</p>
          }
        </div>
      </section>
    </div>
  `,
})
export class PacienteInicioPage {
  private readonly api = inject(SchedulingApiService);
  private readonly badges = inject(BadgeService);
  readonly session = inject(SessionService);
  readonly statusLabel = STATUS_LABEL;
  readonly statusClass = STATUS_CLASS;
  readonly date = formatDate;
  readonly time = hhmm;
  readonly all = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly upcoming = computed(() =>
    this.all().filter((a) => (a.status === 'APPROVED' || a.status === 'REQUESTED') && isFuture(a.date, a.startTime)),
  );
  readonly next = computed(() => this.upcoming().find((a) => a.status === 'APPROVED') ?? null);

  constructor() {
    this.api.mine().subscribe({
      next: (items) => {
        this.all.set(items);
        this.loading.set(false);
        this.badges.refresh();
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(apiMessage(e, 'No fue posible cargar tus citas.'));
      },
    });
  }
}
