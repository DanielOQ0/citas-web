import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FcvDataService } from '../../../services/fcv-data.service';
import { Cita } from '../../../models/fcv.models';

@Component({
  selector: 'app-admin-solicitudes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb y Encabezado con Métricas de Despacho -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Administración Clínica</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Solicitudes y Reprogramación</span>
          </nav>
          <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Gestión de Solicitudes y Reprogramaciones
          </h1>
          <p class="text-xs text-on-surface-variant mt-1">
            Despacho nominal de citas especializadas (HU-017) y conciliación de cambios de horario (HU-020).
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span>{{ totalPendientes() }} Pendientes en cola</span>
          </span>
          <span class="hidden sm:inline-flex px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
            Tiempo prom. 18 min
          </span>
        </div>
      </div>

      <!-- Pestañas Principales (Tabs) -->
      <div class="flex items-center gap-3 border-b border-outline-variant/40 pb-px">
        <button
          type="button"
          id="tab-especializadas"
          (click)="activeTab.set('especializadas')"
          [class]="activeTab() === 'especializadas'
            ? 'border-b-2 border-primary text-primary font-bold'
            : 'text-on-surface-variant hover:text-on-surface font-medium'"
          class="pb-3 px-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">medical_services</span>
          <span>Citas Especializadas</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            {{ fcvService.pendingSpecializedAppointments().length }}
          </span>
        </button>

        <button
          type="button"
          id="tab-reprogramaciones"
          (click)="activeTab.set('reprogramaciones')"
          [class]="activeTab() === 'reprogramaciones'
            ? 'border-b-2 border-primary text-primary font-bold'
            : 'text-on-surface-variant hover:text-on-surface font-medium'"
          class="pb-3 px-2 text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-lg">swap_horiz</span>
          <span>Reprogramaciones</span>
          <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
            {{ fcvService.pendingReprogramaciones().length }}
          </span>
        </button>
      </div>

      <!-- TAB 1: CITAS ESPECIALIZADAS -->
      @if (activeTab() === 'especializadas') {
        <div class="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="font-title-md font-bold text-on-surface text-base">
                Cola de Valoración Especializada (HU-017)
              </h3>
              <p class="text-xs text-on-surface-variant">
                Las citas especializadas de 60 minutos bloquean 2 franjas contiguas de 30 minutos y requieren validación del despacho.
              </p>
            </div>
          </div>

          <!-- Table Responsive -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/30">
                <tr>
                  <th class="py-3 px-4">Radicado & Paciente</th>
                  <th class="py-3 px-4">Especialidad</th>
                  <th class="py-3 px-4">Profesional</th>
                  <th class="py-3 px-4">Fecha & Franja</th>
                  <th class="py-3 px-4">Sede / Consultorio</th>
                  <th class="py-3 px-4 text-right">Acciones de Despacho</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/20">
                @for (cita of fcvService.pendingSpecializedAppointments(); track cita.id) {
                  <tr class="hover:bg-surface-container-low/50 transition-colors">
                    <!-- Paciente -->
                    <td class="py-3.5 px-4">
                      <span class="font-mono text-primary font-bold block">{{ cita.codigo }}</span>
                      <span class="font-bold text-on-surface text-sm block">{{ cita.pacienteNombre }}</span>
                      <span class="text-on-surface-variant text-[11px]">{{ cita.pacienteDoc }}</span>
                    </td>

                    <!-- Especialidad -->
                    <td class="py-3.5 px-4">
                      <span class="font-bold text-on-surface block">{{ cita.especialidad }}</span>
                      <span class="text-outline text-[11px]">{{ cita.duracionMinutos }} min (2 franjas)</span>
                    </td>

                    <!-- Profesional -->
                    <td class="py-3.5 px-4">
                      <span class="font-semibold text-on-surface block">{{ cita.profesionalNombre }}</span>
                      <span class="text-on-surface-variant text-[11px]">{{ cita.profesionalSubtitulo }}</span>
                    </td>

                    <!-- Fecha & Franja -->
                    <td class="py-3.5 px-4">
                      <span class="font-bold text-primary block">{{ cita.fechaTexto }}</span>
                      <span class="text-on-surface-variant text-[11px]">{{ cita.hora }}</span>
                    </td>

                    <!-- Sede -->
                    <td class="py-3.5 px-4">
                      <span class="font-medium text-on-surface block">{{ cita.sede }}</span>
                      <span class="text-outline text-[11px]">{{ cita.consultorio }}</span>
                    </td>

                    <!-- Acciones -->
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="openRechazoModal(cita)"
                          class="px-3 py-1.5 rounded-xl bg-surface-container text-error hover:bg-error-container border border-error/20 font-semibold transition-colors cursor-pointer"
                        >
                          Rechazar
                        </button>
                        <button
                          type="button"
                          (click)="aprobarCita(cita.id)"
                          class="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Aprobar
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="py-8 text-center text-outline">
                      No hay citas especializadas pendientes de aprobación en este momento.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- TAB 2: REPROGRAMACIONES -->
      @if (activeTab() === 'reprogramaciones') {
        <div class="space-y-4">
          @for (rep of fcvService.pendingReprogramaciones(); track rep.id) {
            <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-primary">{{ rep.codigo }}</span>
                  <span class="text-outline text-xs">·</span>
                  <h3 class="font-title-md font-bold text-on-surface text-base">
                    Solicitud de {{ rep.pacienteNombre }} ({{ rep.pacienteDoc }})
                  </h3>
                </div>
                <span class="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  Pendiente de Conciliación
                </span>
              </div>

              <!-- Matriz Comparativa Lado a Lado -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <!-- Franja Actual -->
                <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-outline block">
                    Franja Actual Asignada
                  </span>
                  <p class="font-bold text-on-surface text-sm">{{ rep.especialidad }}</p>
                  <p class="text-on-surface-variant">Profesional: {{ rep.profesional }}</p>
                  <p class="text-primary font-bold">{{ rep.fechaActual }} · {{ rep.horaActual }}</p>
                  <p class="text-outline">{{ rep.sede }} ({{ rep.consultorio }})</p>
                </div>

                <!-- Nueva Franja Solicitada -->
                <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-2">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Nueva Franja Solicitada
                  </span>
                  <p class="font-bold text-emerald-900 text-sm">{{ rep.especialidad }}</p>
                  <p class="text-emerald-800">Profesional: {{ rep.profesional }}</p>
                  <p class="text-emerald-900 font-bold">{{ rep.fechaPropuesta }} · {{ rep.horaPropuesta }}</p>
                  <p class="text-emerald-800">{{ rep.sede }} ({{ rep.consultorio }})</p>
                </div>
              </div>

              <!-- Motivo Registrado por el Paciente -->
              <div class="p-3.5 rounded-2xl bg-surface-container-low text-xs space-y-1">
                <span class="text-outline font-semibold block text-[11px]">Motivo manifestado por el usuario:</span>
                <p class="text-on-surface font-medium leading-relaxed">{{ rep.motivo }}</p>
              </div>

              <!-- Botones de Conciliación Asistencial -->
              <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2.5 flex-wrap">
                <button
                  type="button"
                  (click)="rechazarReprog(rep.id)"
                  class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-error hover:bg-error-container border border-error/20 transition-colors cursor-pointer"
                >
                  Rechazar cambio conservando horario actual
                </button>
                <button
                  type="button"
                  (click)="aprobarReprog(rep.id)"
                  class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Aprobar cambio y liberar horario anterior
                </button>
              </div>
            </div>
          } @empty {
            <div class="p-8 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 text-center text-xs text-outline">
              No hay solicitudes de reprogramación pendientes en este momento.
            </div>
          }
        </div>
      }
    </div>

    <!-- Modal de Rechazo Obligatorio con Auditoría Inmutable (HU-017 / HU-025) -->
    @if (selectedCitaToReject()) {
      @let c = selectedCitaToReject()!;
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
        <div class="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-variant/40 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div class="flex items-center gap-2.5 text-error">
              <span class="material-symbols-outlined text-2xl">cancel</span>
              <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                Rechazo de Solicitud Asistencial
              </h3>
            </div>
            <button
              type="button"
              (click)="selectedCitaToReject.set(null)"
              class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="p-3.5 rounded-2xl bg-surface-container-low text-xs space-y-1">
            <span class="text-outline">Paciente:</span>
            <p class="font-bold text-on-surface text-sm">
              {{ c.pacienteNombre }} · {{ c.pacienteDoc }}
            </p>
            <p class="text-on-surface-variant">
              Solicitud de {{ c.especialidad }} ({{ c.fechaTexto }} · {{ c.hora }})
            </p>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="textarea-motivo-rechazo" class="block text-xs font-semibold text-on-surface">
                Motivo Institucional de Rechazo (Obligatorio)
              </label>
              <span class="text-[11px] text-outline">
                {{ rejectionText().length }} caracteres
              </span>
            </div>
            <textarea
              id="textarea-motivo-rechazo"
              [value]="rejectionText()"
              (input)="onRejectionTextInput($event)"
              rows="3"
              placeholder="Indique la causa médica o administrativa (ej: Cupo quirúrgico prioritario asignado en dicha franja)..."
              class="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs focus:ring-2 focus:ring-error focus:outline-none"
            ></textarea>
            @if (rejectionText().length < 8) {
              <p class="text-[11px] text-error mt-1">El motivo debe contener al menos 8 caracteres para trazabilidad médica.</p>
            }
          </div>

          <div class="p-3 rounded-2xl bg-error-container/30 border border-error/20 text-xs text-on-error-container flex items-start gap-2">
            <span class="material-symbols-outlined text-error text-base shrink-0 mt-0.5">policy</span>
            <span class="text-[11px] leading-tight">
              El motivo ingresado quedará registrado de forma inmutable en el historial del paciente y en el ledger de auditoría hospitalaria FCV (HU-025).
            </span>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              (click)="selectedCitaToReject.set(null)"
              class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              [disabled]="rejectionText().length < 8"
              (click)="confirmarRechazo()"
              class="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-semibold hover:bg-error/90 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Confirmar Rechazo y Notificar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminSolicitudesPage {
  readonly fcvService = inject(FcvDataService);

  readonly activeTab = signal<'especializadas' | 'reprogramaciones'>('especializadas');
  readonly selectedCitaToReject = signal<Cita | null>(null);
  readonly rejectionText = signal<string>('Cupo quirúrgico prioritario asignado en dicha franja.');

  totalPendientes() {
    return this.fcvService.pendingSpecializedAppointments().length + this.fcvService.pendingReprogramaciones().length;
  }

  aprobarCita(citaId: string) {
    this.fcvService.aprobarCitaEspecializada(citaId);
  }

  openRechazoModal(cita: Cita) {
    this.selectedCitaToReject.set(cita);
    this.rejectionText.set('Cupo quirúrgico prioritario asignado en dicha franja.');
  }

  onRejectionTextInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.rejectionText.set(target.value);
  }

  confirmarRechazo() {
    const cita = this.selectedCitaToReject();
    if (!cita) return;

    this.fcvService.rechazarCitaEspecializada(cita.id, this.rejectionText());
    this.selectedCitaToReject.set(null);
  }

  aprobarReprog(repId: string) {
    this.fcvService.aprobarReprogramacion(repId);
  }

  rechazarReprog(repId: string) {
    this.fcvService.rechazarReprogramacion(repId);
  }
}
