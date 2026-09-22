import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FcvDataService } from '../../../services/fcv-data.service';
import { Cita, AppointmentStatus } from '../../../models/fcv.models';

@Component({
  selector: 'app-mis-citas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Encabezado con Métricas y Switch de Vista -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Portal Paciente</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Mis Citas</span>
          </nav>
          <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Mis Citas, Historial y Reprogramación
          </h1>
          <p class="text-xs text-on-surface-variant mt-1">
            Historial completo de citas asignadas, interconsultas solicitadas y trazabilidad clínica del paciente.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Badges de Métricas -->
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
              {{ activeCount() }} Activas
            </span>
            <span class="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold">
              {{ historyCount() }} Históricas
            </span>
          </div>

          <!-- View Switcher -->
          <div class="flex items-center p-1 rounded-2xl bg-surface-container border border-outline-variant/40 text-xs">
            <button
              type="button"
              id="btn-view-list"
              (click)="viewMode.set('list')"
              [class]="viewMode() === 'list'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'"
              class="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-base">format_list_bulleted</span>
              <span>Lista</span>
            </button>
            <button
              type="button"
              id="btn-view-calendar"
              (click)="viewMode.set('calendar')"
              [class]="viewMode() === 'calendar'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'"
              class="px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-base">calendar_view_month</span>
              <span>Calendario</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros por Estado (Pills Horizontales) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          type="button"
          (click)="selectedStatusFilter.set('todas')"
          [class]="selectedStatusFilter() === 'todas'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Todas ({{ fcvService.citas().length }})
        </button>
        <button
          type="button"
          (click)="selectedStatusFilter.set('Confirmada')"
          [class]="selectedStatusFilter() === 'Confirmada'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Confirmada ({{ countByStatus('Confirmada') }})
        </button>
        <button
          type="button"
          (click)="selectedStatusFilter.set('Pendiente de aprobación')"
          [class]="selectedStatusFilter() === 'Pendiente de aprobación'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Pendiente ({{ countByStatus('Pendiente de aprobación') }})
        </button>
        <button
          type="button"
          (click)="selectedStatusFilter.set('Rechazada')"
          [class]="selectedStatusFilter() === 'Rechazada'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Rechazada ({{ countByStatus('Rechazada') }})
        </button>
        <button
          type="button"
          (click)="selectedStatusFilter.set('Realizada')"
          [class]="selectedStatusFilter() === 'Realizada'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Realizada ({{ countByStatus('Realizada') }})
        </button>
        <button
          type="button"
          (click)="selectedStatusFilter.set('Cancelada')"
          [class]="selectedStatusFilter() === 'Cancelada'
            ? 'bg-primary text-on-primary font-bold shadow-xs'
            : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container'"
          class="px-3.5 py-1.5 rounded-full whitespace-nowrap transition-colors"
        >
          Cancelada ({{ countByStatus('Cancelada') }})
        </button>
      </div>

      <!-- VISTA CALENDARIO -->
      @if (viewMode() === 'calendar') {
        <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary text-xl">event</span>
              <h3 class="font-title-lg font-bold text-on-surface text-lg">
                Agenda Mensual · Abril 2024
              </h3>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold">
              <span class="inline-flex items-center gap-1 text-emerald-700">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Confirmada
              </span>
              <span class="inline-flex items-center gap-1 text-amber-700">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pendiente
              </span>
              <span class="inline-flex items-center gap-1 text-error">
                <span class="w-2.5 h-2.5 rounded-full bg-error"></span> Rechazada
              </span>
            </div>
          </div>

          <!-- Calendar Grid 7 columns -->
          <div class="grid grid-cols-7 gap-2 text-center text-xs">
            <div class="font-bold text-outline py-1">Lun</div>
            <div class="font-bold text-outline py-1">Mar</div>
            <div class="font-bold text-outline py-1">Mié</div>
            <div class="font-bold text-outline py-1">Jue</div>
            <div class="font-bold text-outline py-1">Vie</div>
            <div class="font-bold text-outline py-1 text-outline-variant">Sáb</div>
            <div class="font-bold text-outline py-1 text-outline-variant">Dom</div>

            <!-- Days of April -->
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">1</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">2</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">3</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">4</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">5</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">6</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">7</span>
            </div>

            <!-- Week 2 -->
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">8</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">9</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-on-surface">10</span>
              <div class="mt-1 p-1.5 rounded-lg bg-surface-container-highest text-[10px] font-bold text-on-surface leading-tight">
                11:00 Pediatría (Realizada)
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">11</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">12</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">13</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">14</span>
            </div>

            <!-- Week 3 -->
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-on-surface">15</span>
              <div class="mt-1 p-1.5 rounded-lg bg-error-container text-error text-[10px] font-bold leading-tight">
                14:00 Dermatología (Rechazada)
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">16</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">17</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">18</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">19</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">20</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">21</span>
            </div>

            <!-- Week 4 -->
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">22</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-outline">23</span>
            </div>
            <div class="p-3 rounded-2xl bg-primary-fixed/40 border border-primary/30 min-h-24 text-left">
              <span class="font-bold text-primary">24 (Hoy)</span>
              <div class="mt-1 p-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold leading-tight">
                08:30 Med. General (Confirmada)
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 min-h-24 text-left">
              <span class="font-bold text-amber-900">25</span>
              <div class="mt-1 p-1.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-bold leading-tight">
                10:00 Cardiología (Pendiente)
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low min-h-24 text-left">
              <span class="font-bold text-on-surface">26</span>
              <div class="mt-1 p-1.5 rounded-lg bg-emerald-100 text-emerald-900 text-[10px] font-bold leading-tight">
                09:30 Dermatología (Confirmada)
              </div>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">27</span>
            </div>
            <div class="p-3 rounded-2xl bg-surface-container-low/50 min-h-24 text-left opacity-60">
              <span class="font-bold text-outline">28</span>
            </div>
          </div>
        </div>
      }

      <!-- VISTA LISTA PRINCIPAL CON TRAZABILIDAD LATERAL -->
      @if (viewMode() === 'list') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Columna Izquierda: Tarjetas de Citas (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            @for (cita of filteredCitas(); track cita.id) {
              <div
                tabindex="0"
                role="button"
                (keydown.enter)="selectedCita.set(cita)"
                (keydown.space)="selectedCita.set(cita)"
                class="rounded-3xl bg-surface-container-lowest p-5 sm:p-6 border transition-all shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                [class]="selectedCita()?.id === cita.id
                  ? 'border-primary ring-2 ring-primary/20 bg-primary-fixed/10'
                  : 'border-outline-variant/40 hover:border-outline-variant'"
                (click)="selectedCita.set(cita)"
              >
                <!-- Card Header -->
                <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-primary">{{ cita.codigo }}</span>
                    <span class="text-outline text-xs">·</span>
                    <span class="text-xs font-semibold text-on-surface">{{ cita.especialidad }}</span>
                  </div>

                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    [class]="getStatusBadgeClass(cita.estado)"
                  >
                    {{ cita.estado }}
                  </span>
                </div>

                <!-- Professional & Campus Info -->
                <div class="space-y-2 mb-4 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Profesional:</span>
                    <span class="font-bold text-on-surface">{{ cita.profesionalNombre }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Fecha & Hora:</span>
                    <span class="font-bold text-primary">{{ cita.fechaTexto }} · {{ cita.hora }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Sede & Consultorio:</span>
                    <span class="font-medium text-on-surface-variant">{{ cita.sede }} ({{ cita.consultorio }})</span>
                  </div>
                </div>

                <!-- Motivo permanente de rechazo si aplica -->
                @if (cita.estado === 'Rechazada' && cita.motivoRechazo) {
                  <div class="p-3 rounded-2xl bg-error-container/40 border border-error/20 text-xs text-on-error-container mb-4">
                    <span class="font-bold block mb-0.5">Motivo registrado institucional:</span>
                    <p class="text-[11px] leading-relaxed">{{ cita.motivoRechazo }}</p>
                  </div>
                }

                <!-- Observación asistencial si realizada -->
                @if (cita.estado === 'Realizada' && cita.registroHoraConfirmado) {
                  <div class="p-2.5 rounded-xl bg-surface-container-high text-xs text-on-surface-variant mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                    <span>Atención médica completada. Confirmado a las {{ cita.registroHoraConfirmado }}</span>
                  </div>
                }

                <!-- Acciones de la tarjeta -->
                <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="selectedCita.set(cita); $event.stopPropagation()"
                    class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-base">history_edu</span>
                    <span>Ver trazabilidad</span>
                  </button>

                  <div class="flex items-center gap-2">
                    @if (cita.estado === 'Confirmada') {
                      <button
                        type="button"
                        (click)="openRescheduleModal(cita); $event.stopPropagation()"
                        class="px-3 py-1.5 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        Reprogramar
                      </button>
                      <button
                        type="button"
                        (click)="openCancelModal(cita); $event.stopPropagation()"
                        class="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-xs font-semibold text-error hover:bg-error-container/40 border border-error/20 transition-colors"
                      >
                        Cancelar
                      </button>
                    }
                    @if (cita.estado === 'Rechazada') {
                      <a
                        routerLink="/paciente/buscar-disponibilidad"
                        (click)="$event.stopPropagation()"
                        class="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors"
                      >
                        Buscar nueva fecha
                      </a>
                    }
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Columna Derecha: Trazabilidad de Estados - Auditoría Inmutable HU-025 (5 cols) -->
          <div class="lg:col-span-5">
            <div class="sticky top-24 rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs space-y-5">
              <div class="pb-3 border-b border-outline-variant/30">
                <div class="flex items-center gap-2 text-primary">
                  <span class="material-symbols-outlined text-2xl">policy</span>
                  <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                    Trazabilidad de Estados
                  </h3>
                </div>
                <span class="text-[11px] text-outline uppercase tracking-wider block font-semibold mt-0.5">
                  Auditoría Inmutable HU-025
                </span>
              </div>

              @if (selectedCita()) {
                @let c = selectedCita()!;
                <div>
                  <div class="p-3 rounded-2xl bg-surface-container-low mb-4 text-xs">
                    <span class="text-outline block text-[10px] uppercase font-bold">Cita en auditoría:</span>
                    <span class="font-bold text-on-surface text-sm block">{{ c.codigo }} · {{ c.especialidad }}</span>
                    <span class="text-on-surface-variant">{{ c.profesionalNombre }}</span>
                  </div>

                  <!-- Timeline Stream -->
                  <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/40">
                    @for (evento of c.trazabilidad; track $index) {
                      <div class="relative">
                        <!-- Timeline Bullet -->
                        <span
                          class="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold"
                          [class]="evento.isCurrent ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'"
                        >
                          {{ $index + 1 }}
                        </span>

                        <div>
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-xs text-on-surface">
                              Estado: {{ evento.estado }}
                            </span>
                            <span class="text-[10px] text-outline font-medium">
                              {{ evento.fechaHora }}
                            </span>
                          </div>

                          <p class="text-[11px] text-on-surface-variant mt-1 leading-snug">
                            <strong>Actor:</strong> {{ evento.actor }}
                          </p>
                          <p class="text-[11px] text-outline leading-snug">
                            <strong>Fuente:</strong> {{ evento.fuente }}
                          </p>

                          @if (evento.descripcion) {
                            <p class="text-[11px] text-error mt-1 bg-error-container/20 p-2 rounded-lg border border-error/20">
                              {{ evento.descripcion }}
                            </p>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Huella Criptográfica Simulada -->
                  <div class="mt-6 pt-4 border-t border-outline-variant/20 text-[10px] text-outline space-y-1">
                    <div class="flex items-center justify-between font-mono">
                      <span>TX-ID: 7a9e22...8f3c</span>
                      <span class="text-emerald-700 font-bold">SHA-256 Validado</span>
                    </div>
                    <p class="leading-tight">
                      Registro protegido contra alteraciones en el ledger de auditoría hospitalaria FCV.
                    </p>
                  </div>
                </div>
              } @else {
                <div class="py-8 text-center text-xs text-outline">
                  Seleccione una cita de la lista para visualizar su bitácora inmutable de eventos.
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- Modal de Reprogramación con Comparativa Lado a Lado -->
    @if (rescheduleCita()) {
      @let c = rescheduleCita()!;
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
        <div class="w-full max-w-2xl bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-variant/40 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-primary text-2xl">event_repeat</span>
              <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                Solicitud de Reprogramación (HU-020)
              </h3>
            </div>
            <button
              type="button"
              (click)="rescheduleCita.set(null)"
              class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Comparativa Lado a Lado: Franja Actual vs Franja Propuesta -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-outline block">
                Cita Actual Asignada
              </span>
              <p class="font-bold text-on-surface text-sm">{{ c.especialidad }}</p>
              <p class="text-on-surface-variant">{{ c.profesionalNombre }}</p>
              <p class="text-primary font-bold">{{ c.fechaTexto }} · {{ c.hora }}</p>
              <p class="text-outline">{{ c.sede }} ({{ c.consultorio }})</p>
            </div>

            <div class="p-4 rounded-2xl bg-primary-fixed/30 border border-primary/30 space-y-3">
              <span class="text-[10px] font-bold uppercase tracking-wider text-primary block">
                Nuevo Horario Solicitado
              </span>
              <div>
                <label for="input-resched-modal-date" class="block font-semibold text-on-surface mb-1 text-[11px]">Nueva Fecha</label>
                <input
                  type="date"
                  id="input-resched-modal-date"
                  #reschedDate
                  value="2024-04-29"
                  class="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs"
                />
              </div>
              <div>
                <label for="select-resched-modal-time" class="block font-semibold text-on-surface mb-1 text-[11px]">Franja Horaria</label>
                <select id="select-resched-modal-time" #reschedTime class="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs">
                  <option value="09:00 - 09:30">09:00 - 09:30 (Mañana)</option>
                  <option value="11:00 - 11:30">11:00 - 11:30 (Mañana)</option>
                  <option value="14:00 - 14:30" selected>14:00 - 14:30 (Tarde)</option>
                  <option value="16:00 - 16:30">16:00 - 16:30 (Tarde)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Motivo de Reprogramación -->
          <div>
            <label for="textarea-resched-modal-reason" class="block text-xs font-semibold text-on-surface mb-1.5">
              Motivo de la solicitud (Obligatorio)
            </label>
            <textarea
              id="textarea-resched-modal-reason"
              #reschedReason
              rows="2"
              class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
              placeholder="Describa el motivo por el cual no puede asistir en la fecha actual..."
            >Cruce de actividades laborales imprevisto en la jornada asignada.</textarea>
          </div>

          <div class="p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs">
            Su cita actual conservará su validez y cupo hasta que el despacho administrativo evalúe y concilie la nueva franja solicitada.
          </div>

          <!-- Acciones del Modal -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
            <button
              type="button"
              (click)="rescheduleCita.set(null)"
              class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="confirmReschedule(c, reschedDate.value, reschedTime.value, reschedReason.value)"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Radicar Solicitud de Reprogramación
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Modal Cancelar Cita -->
    @if (cancelCita()) {
      @let c = cancelCita()!;
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
        <div class="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
          <div class="flex items-center gap-3 text-error">
            <span class="material-symbols-outlined text-3xl">cancel</span>
            <h3 class="font-title-lg font-bold text-on-surface">Liberar Cupo Asistencial</h3>
          </div>

          <p class="text-xs text-on-surface-variant leading-relaxed">
            ¿Confirma que desea cancelar su cita de <strong>{{ c.especialidad }}</strong> del día <strong>{{ c.fechaTexto }}</strong>?
            El sistema registrará el evento en la auditoría HU-025 y liberará el horario de forma inmediata.
          </p>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              (click)="cancelCita.set(null)"
              class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high"
            >
              No, mantener cita
            </button>
            <button
              type="button"
              (click)="confirmCancel(c.id)"
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
export class MisCitasPage {
  readonly fcvService = inject(FcvDataService);

  readonly viewMode = signal<'list' | 'calendar'>('list');
  readonly selectedStatusFilter = signal<string>('todas');
  readonly selectedCita = signal<Cita | null>(this.fcvService.citas()[0]);

  readonly rescheduleCita = signal<Cita | null>(null);
  readonly cancelCita = signal<Cita | null>(null);

  activeCount() {
    return this.fcvService.citas().filter((c) => c.estado === 'Confirmada' || c.estado === 'Pendiente de aprobación').length;
  }

  historyCount() {
    return this.fcvService.citas().filter((c) => c.estado === 'Realizada' || c.estado === 'Rechazada' || c.estado === 'Cancelada').length;
  }

  countByStatus(status: AppointmentStatus) {
    return this.fcvService.citas().filter((c) => c.estado === status).length;
  }

  filteredCitas() {
    if (this.selectedStatusFilter() === 'todas') {
      return this.fcvService.citas();
    }
    return this.fcvService.citas().filter((c) => c.estado === this.selectedStatusFilter());
  }

  getStatusBadgeClass(status: AppointmentStatus) {
    switch (status) {
      case 'Confirmada':
        return 'bg-emerald-100 text-emerald-800';
      case 'Pendiente de aprobación':
        return 'bg-amber-100 text-amber-800';
      case 'Rechazada':
        return 'bg-error-container text-on-error-container';
      case 'Realizada':
        return 'bg-primary-fixed text-on-primary-fixed';
      case 'Cancelada':
        return 'bg-surface-container-high text-outline';
      default:
        return 'bg-surface-container text-on-surface';
    }
  }

  openRescheduleModal(c: Cita) {
    this.rescheduleCita.set(c);
  }

  confirmReschedule(c: Cita, date: string, time: string, reason: string) {
    this.fcvService.solicitarReprogramacion(c.id, date, time, reason);
    this.rescheduleCita.set(null);
  }

  openCancelModal(c: Cita) {
    this.cancelCita.set(c);
  }

  confirmCancel(citaId: string) {
    this.fcvService.cancelarCita(citaId);
    this.cancelCita.set(null);
  }
}
