import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FcvDataService } from '../../../services/fcv-data.service';
import { Cita } from '../../../models/fcv.models';

@Component({
  selector: 'app-paciente-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb & Top bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Portal Ambulatorio FCV</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Resumen de Citas</span>
          </nav>
          <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Bienvenido, {{ fcvService.currentUser().name.split(' ')[0] }} {{ fcvService.currentUser().name.split(' ')[1] || '' }}
          </h1>
        </div>

        <!-- Patient ID Pill Badge -->
        <div class="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
            {{ fcvService.currentUser().avatarText }}
          </div>
          <div class="text-left text-xs">
            <span class="font-bold text-on-surface block leading-tight">
              {{ fcvService.currentUser().name }}
            </span>
            <span class="text-on-surface-variant font-medium block leading-tight text-[11px]">
              {{ fcvService.currentUser().documento }} · {{ fcvService.currentUser().eps || 'EPS Demo A' }} ({{ fcvService.currentUser().plan || 'Plan Demo 1' }})
            </span>
          </div>
        </div>
      </div>

      <!-- Banner Principal de Agendamiento (Blue CTA) -->
      <div class="relative overflow-hidden rounded-3xl bg-primary text-on-primary p-6 sm:p-8 shadow-lg shadow-primary/15 border border-primary-container">
        <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-primary-container/40 blur-2xl pointer-events-none"></div>

        <div class="relative z-10 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-3 border border-white/15">
            <span class="material-symbols-outlined text-sm">schedule</span>
            <span>Disponibilidad inmediata en tiempo real</span>
          </div>

          <h2 class="font-headline-sm text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            ¿Necesitas una nueva valoración médica?
          </h2>
          <p class="text-white/80 text-sm leading-relaxed mb-6 font-body-md">
            Accede a la red de sedes universitarias para consultar franjas de Medicina General (aprobación automática) o solicitar interconsultas con profesionales especialistas.
          </p>

          <a
            id="btn-banner-agendar"
            routerLink="/paciente/buscar-disponibilidad"
            class="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-surface-container-lowest text-primary hover:bg-surface font-semibold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Solicitar cita médica</span>
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </a>
        </div>
      </div>

      <!-- Alerta Institucional de Cita Rechazada previa (con motivo obligatorio y acción) -->
      @if (rejectedAppointment()) {
        <div class="rounded-2xl p-4 sm:p-5 bg-error-container/40 border border-error/30 text-on-error-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-error text-2xl shrink-0 mt-0.5">warning</span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-title-md font-bold text-sm text-on-surface">
                  Consulta de {{ rejectedAppointment()?.especialidad }} ({{ rejectedAppointment()?.fechaTexto }})
                </span>
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-error text-on-error uppercase tracking-wider">
                  Rechazada
                </span>
              </div>
              <p class="text-xs text-on-surface-variant mt-1 leading-normal">
                <strong>Motivo registrado:</strong> {{ rejectedAppointment()?.motivoRechazo }}
              </p>
            </div>
          </div>
          <a
            routerLink="/paciente/buscar-disponibilidad"
            class="shrink-0 px-4 py-2 rounded-xl bg-surface-container-lowest text-error hover:bg-error-container border border-error/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Buscar otra fecha</span>
            <span class="material-symbols-outlined text-base">refresh</span>
          </a>
        </div>
      }

      <!-- Próxima Cita Confirmada (Cita destacada en tarjeta amplia) -->
      @if (nextConfirmedAppointment()) {
        @let nextApp = nextConfirmedAppointment();
        <div class="rounded-3xl bg-surface-container-lowest p-6 sm:p-7 border border-outline-variant/40 shadow-xs">
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">event_upcoming</span>
              <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                Próxima cita confirmada
              </h3>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Confirmada</span>
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <!-- Columna Datos Médico & Especialidad -->
            <div class="md:col-span-4 flex items-center gap-3.5">
              <div class="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary font-bold text-lg shrink-0">
                <span class="material-symbols-outlined text-3xl">stethoscope</span>
              </div>
              <div>
                <span class="text-xs font-semibold text-primary block uppercase tracking-wider">
                  {{ nextApp?.especialidad }}
                </span>
                <h4 class="font-title-md font-bold text-on-surface text-base">
                  {{ nextApp?.profesionalNombre }}
                </h4>
                <span class="text-xs text-on-surface-variant block">
                  {{ nextApp?.profesionalSubtitulo }} · {{ nextApp?.profesionalRegistro }}
                </span>
              </div>
            </div>

            <!-- Columna Fecha, Hora y Consultorio -->
            <div class="md:col-span-5 grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-lg mt-0.5">calendar_today</span>
                <div>
                  <span class="text-[11px] font-semibold text-outline uppercase block">Fecha y Hora</span>
                  <span class="text-xs font-bold text-on-surface block">{{ nextApp?.fechaTexto }}</span>
                  <span class="text-xs font-medium text-primary">{{ nextApp?.hora }}</span>
                </div>
              </div>
              <div class="flex items-start gap-2">
                <span class="material-symbols-outlined text-primary text-lg mt-0.5">location_on</span>
                <div>
                  <span class="text-[11px] font-semibold text-outline uppercase block">Ubicación</span>
                  <span class="text-xs font-bold text-on-surface block">{{ nextApp?.sede }}</span>
                  <span class="text-xs font-medium text-on-surface-variant">{{ nextApp?.consultorio }}</span>
                </div>
              </div>
            </div>

            <!-- Columna Acciones -->
            <div class="md:col-span-3 flex flex-row md:flex-col gap-2 justify-end">
              <button
                type="button"
                (click)="openRescheduleModal(nextApp!)"
                class="flex-1 py-2 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-base">edit_calendar</span>
                <span>Reprogramar</span>
              </button>
              <button
                type="button"
                (click)="openCancelModal(nextApp!)"
                class="flex-1 py-2 px-3 rounded-xl bg-surface-container-lowest text-error hover:bg-error-container/40 border border-error/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span class="material-symbols-outlined text-base">cancel</span>
                <span>Cancelar cita</span>
              </button>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-outline-variant/20 flex items-center gap-2 text-xs text-on-surface-variant">
            <span class="material-symbols-outlined text-base text-primary">info</span>
            <span>Recuerda presentar tu documento de identidad físico y llegar con 15 minutos de anticipación al módulo de admisión.</span>
          </div>
        </div>
      }

      <!-- Sección de Citas Próximas y en Trámite -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">pending_actions</span>
            <h3 class="font-title-lg font-bold text-on-surface text-lg">
              Citas próximas y en trámite
            </h3>
          </div>
          <a
            routerLink="/paciente/mis-citas"
            class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Ver historial completo</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Card de Cita Especializada Pendiente de Aprobación -->
          @for (cita of pendingApprovalAppointments(); track cita.id) {
            <div class="rounded-2xl bg-surface-container-lowest p-5 border border-outline-variant/40 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-outline">
                    Interconsulta Docente · {{ cita.codigo }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                    <span>Pendiente de aprobación</span>
                  </span>
                </div>

                <h4 class="font-title-md font-bold text-on-surface text-base">
                  {{ cita.especialidad }}
                </h4>
                <p class="text-xs text-on-surface-variant mt-0.5">
                  {{ cita.profesionalNombre }} · {{ cita.profesionalSubtitulo }}
                </p>

                <div class="mt-3.5 p-3 rounded-xl bg-surface-container-low text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Horario solicitado:</span>
                    <span class="font-semibold text-on-surface">{{ cita.fechaTexto }} · {{ cita.hora }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Sede:</span>
                    <span class="font-medium text-on-surface-variant">{{ cita.sede }} ({{ cita.consultorio }})</span>
                  </div>
                </div>

                <p class="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 leading-snug">
                  En revisión administrativa de pertinencia asistencial (HU-017). Notificación estimada en 24 hrs hábiles.
                </p>
              </div>

              <div class="pt-4 mt-2 border-t border-outline-variant/30 flex items-center justify-end">
                <a
                  routerLink="/paciente/mis-citas"
                  class="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Revisar solicitud
                </a>
              </div>
            </div>
          }

          <!-- Card de Cita con Cambio Propuesto por la Clínica (Conciliación) -->
          @for (cita of appointmentsWithProposedChange(); track cita.id) {
            <div class="rounded-2xl bg-surface-container-lowest p-5 border border-primary/30 shadow-xs flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="text-[11px] font-bold uppercase tracking-wider text-outline">
                    Consulta Externa · {{ cita.codigo }}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
                    Confirmada
                  </span>
                </div>

                <h4 class="font-title-md font-bold text-on-surface text-base">
                  {{ cita.especialidad }}
                </h4>
                <p class="text-xs text-on-surface-variant mt-0.5">
                  {{ cita.profesionalNombre }} · {{ cita.sede }} ({{ cita.consultorio }})
                </p>

                <!-- Bloque de Cambio Propuesto -->
                <div class="mt-3.5 p-3.5 rounded-xl bg-primary-fixed/30 border border-primary/20 space-y-2">
                  <div class="flex items-center gap-1.5 text-primary text-xs font-bold">
                    <span class="material-symbols-outlined text-base">swap_horiz</span>
                    <span>Cambio pendiente de confirmación por el paciente</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="p-2 rounded-lg bg-white/60">
                      <span class="text-[10px] text-outline uppercase block font-semibold">Fecha actual:</span>
                      <span class="font-bold text-on-surface block">{{ cita.fechaTexto }}</span>
                      <span class="text-[11px] text-on-surface-variant">{{ cita.hora }}</span>
                    </div>
                    <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span class="text-[10px] text-emerald-800 uppercase block font-bold">Cambio propuesto:</span>
                      <span class="font-bold text-emerald-900 block">{{ cita.cambioPropuesto?.fechaTexto }}</span>
                      <span class="text-[11px] text-emerald-800">{{ cita.cambioPropuesto?.horaTexto }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Acciones de Aceptar o Rechazar Cambio -->
              <div class="pt-4 mt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
                <button
                  type="button"
                  (click)="responderCambio(cita.id, false)"
                  class="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Rechazar cambio
                </button>
                <button
                  type="button"
                  (click)="responderCambio(cita.id, true)"
                  class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-xs transition-colors"
                >
                  Aceptar nueva fecha
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Footer de Entorno Académico FCV -->
      <footer class="pt-6 border-t border-outline-variant/30 text-center text-xs text-outline">
        <p>Entorno Académico Demostrativo FCV - Versión de Prototipo: HU-015 / HU-017 / HU-019</p>
      </footer>
    </div>

    <!-- Modal de Reprogramación Rápida -->
    @if (selectedCitaForReschedule()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
        <div class="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-2xl">event_repeat</span>
              <h3 class="font-title-lg font-bold text-on-surface">Reprogramación de Cita</h3>
            </div>
            <button
              type="button"
              (click)="selectedCitaForReschedule.set(null)"
              class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="p-3.5 rounded-xl bg-surface-container-low text-xs space-y-1">
            <span class="text-outline">Cita actual seleccionada:</span>
            <p class="font-bold text-on-surface text-sm">
              {{ selectedCitaForReschedule()?.especialidad }} · {{ selectedCitaForReschedule()?.profesionalNombre }}
            </p>
            <p class="text-on-surface-variant">
              {{ selectedCitaForReschedule()?.fechaTexto }} de {{ selectedCitaForReschedule()?.hora }} en {{ selectedCitaForReschedule()?.sede }}
            </p>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label for="input-inicio-new-date" class="block font-semibold text-on-surface mb-1">Nueva Fecha Deseada</label>
              <input
                type="date"
                id="input-inicio-new-date"
                #newDateInput
                value="2024-04-29"
                class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm"
              />
            </div>
            <div>
              <label for="select-inicio-new-time" class="block font-semibold text-on-surface mb-1">Franja Horaria Preferida</label>
              <select id="select-inicio-new-time" #newTimeInput class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm">
                <option value="09:00 - 09:30">09:00 - 09:30 (Mañana)</option>
                <option value="11:00 - 11:30">11:00 - 11:30 (Mañana)</option>
                <option value="14:00 - 14:30" selected>14:00 - 14:30 (Tarde)</option>
                <option value="16:00 - 16:30">16:00 - 16:30 (Tarde)</option>
              </select>
            </div>
            <div>
              <label for="textarea-inicio-resched-reason" class="block font-semibold text-on-surface mb-1">Motivo de Reprogramación</label>
              <textarea
                id="textarea-inicio-resched-reason"
                #reasonInput
                rows="2"
                placeholder="Indique brevemente el motivo institucional o personal..."
                class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm"
              >Cruce laboral con horario asignado previamente.</textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="selectedCitaForReschedule.set(null)"
              class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
            >
              Cerrar
            </button>
            <button
              type="button"
              (click)="confirmReschedule(newDateInput.value, newTimeInput.value, reasonInput.value)"
              class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-xs"
            >
              Radicar Solicitud de Reprogramación
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal de Confirmación de Cancelación -->
    @if (selectedCitaForCancel()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
        <div class="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
          <div class="flex items-center gap-3 text-error">
            <span class="material-symbols-outlined text-3xl">warning</span>
            <h3 class="font-title-lg font-bold text-on-surface">Confirmar Cancelación de Cita</h3>
          </div>

          <p class="text-xs text-on-surface-variant leading-relaxed">
            ¿Está seguro de que desea cancelar su cita de <strong>{{ selectedCitaForCancel()?.especialidad }}</strong> para el <strong>{{ selectedCitaForCancel()?.fechaTexto }}</strong>?
            El cupo será liberado inmediatamente para otros pacientes.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="selectedCitaForCancel.set(null)"
              class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
            >
              No, mantener cita
            </button>
            <button
              type="button"
              (click)="confirmCancel()"
              class="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-semibold hover:bg-error/90 shadow-xs"
            >
              Sí, cancelar cita
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class PacienteInicioPage {
  readonly fcvService = inject(FcvDataService);

  readonly selectedCitaForReschedule = signal<Cita | null>(null);
  readonly selectedCitaForCancel = signal<Cita | null>(null);

  rejectedAppointment() {
    return this.fcvService.citas().find((c) => c.estado === 'Rechazada');
  }

  nextConfirmedAppointment() {
    return this.fcvService.citas().find((c) => c.estado === 'Confirmada');
  }

  pendingApprovalAppointments() {
    return this.fcvService.citas().filter((c) => c.estado === 'Pendiente de aprobación');
  }

  appointmentsWithProposedChange() {
    return this.fcvService.citas().filter((c) => !!c.cambioPropuesto);
  }

  openRescheduleModal(cita: Cita) {
    this.selectedCitaForReschedule.set(cita);
  }

  confirmReschedule(date: string, time: string, reason: string) {
    const cita = this.selectedCitaForReschedule();
    if (!cita) return;

    this.fcvService.solicitarReprogramacion(cita.id, date, time, reason);
    this.selectedCitaForReschedule.set(null);
  }

  openCancelModal(cita: Cita) {
    this.selectedCitaForCancel.set(cita);
  }

  confirmCancel() {
    const cita = this.selectedCitaForCancel();
    if (!cita) return;

    this.fcvService.cancelarCita(cita.id);
    this.selectedCitaForCancel.set(null);
  }

  responderCambio(citaId: string, aceptar: boolean) {
    this.fcvService.responderCambioPropuesto(citaId, aceptar);
  }
}
