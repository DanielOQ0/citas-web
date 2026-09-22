import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FcvDataService } from '../../../services/fcv-data.service';

@Component({
  selector: 'app-mi-agenda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb y Encabezado con Métricas del Profesional -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Portal Profesional</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Mi Agenda</span>
          </nav>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Mi Agenda Asistencial
            </h1>
            <span class="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold">
              Hoy: Miércoles, 24 de Abril de 2024
            </span>
          </div>
          <p class="text-xs text-on-surface-variant mt-1">
            Gestión en tiempo real de consultas ambulatorias, control de asistencia y publicación de franjas horarias (HU-023/HU-024).
          </p>
        </div>

        <!-- Indicador de Consultorio & Contadores de Jornada -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="px-3.5 py-1.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 text-xs shadow-xs">
            <span class="text-outline text-[10px] uppercase font-bold block">Ubicación Asignada</span>
            <span class="font-bold text-on-surface">Sede Norte · Cons. 204</span>
          </div>

          <div class="flex items-center gap-1.5 text-xs">
            <span class="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
              {{ atendidasCount() }} Atendidas
            </span>
            <span class="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold">
              1 Por registrar
            </span>
            <span class="px-2.5 py-1 rounded-xl bg-surface-container-high text-on-surface font-semibold">
              1 En espera
            </span>
          </div>
        </div>
      </div>

      <!-- Layout Principal en Dos Columnas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Columna Izquierda: Flujo Cronológico de Pacientes (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs">
            <div class="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-5">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
                  <span class="material-symbols-outlined text-xl">view_timeline</span>
                </div>
                <div>
                  <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                    Agenda Asignada · Dr. Camilo Restrepo
                  </h3>
                  <span class="text-xs text-on-surface-variant font-medium">
                    Medicina General Ambulatoria (30 min por franja)
                  </span>
                </div>
              </div>

              <!-- Switch Día / Semana -->
              <div class="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/40 text-xs">
                <button
                  type="button"
                  [class]="agendaView() === 'dia'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'"
                  (click)="agendaView.set('dia')"
                  class="px-2.5 py-1 rounded-lg transition-colors"
                >
                  Día
                </button>
                <button
                  type="button"
                  [class]="agendaView() === 'semana'
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'"
                  (click)="agendaView.set('semana')"
                  class="px-2.5 py-1 rounded-lg transition-colors"
                >
                  Semana
                </button>
              </div>
            </div>

            <!-- Lista Cronológica de Turnos de Hoy -->
            <div class="space-y-4">
              <!-- Turno 1: 08:30 Carlos Andrés Pérez (Con botones interactivos de Asistencia HU-024) -->
              <div class="rounded-2xl p-4 sm:p-5 bg-surface-container-low border border-outline-variant/40 space-y-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-sm text-primary px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40">
                      08:30 - 09:00
                    </span>
                    <span class="text-xs font-semibold text-outline">Turno 1</span>
                  </div>

                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    [class]="turnoCarlos().estado === 'Realizada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : turnoCarlos().estado === 'No asistió'
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-amber-100 text-amber-900'"
                  >
                    {{ turnoCarlos().observacionAsistencial || turnoCarlos().estado }}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-title-md font-bold text-on-surface text-base">
                      {{ turnoCarlos().pacienteNombre }}
                    </h4>
                    <p class="text-xs text-on-surface-variant">
                      {{ turnoCarlos().pacienteDoc }} · EPS Demo A
                    </p>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    {{ turnoCarlos().pacienteAvatar }}
                  </div>
                </div>

                <!-- Botones de Acción Médica HU-024 -->
                @if (turnoCarlos().estado !== 'Realizada' && turnoCarlos().estado !== 'No asistió') {
                  <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2 flex-wrap">
                    <button
                      type="button"
                      id="btn-marcar-inasistencia"
                      (click)="marcarAsistencia(turnoCarlos().id, 'inasistencia')"
                      class="px-3.5 py-1.5 rounded-xl bg-surface-container-lowest text-error hover:bg-error-container border border-error/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-base">person_off</span>
                      <span>Marcar inasistencia</span>
                    </button>
                    <button
                      type="button"
                      id="btn-marcar-realizada"
                      (click)="marcarAsistencia(turnoCarlos().id, 'realizada')"
                      class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-base">check_circle</span>
                      <span>Marcar como realizada</span>
                    </button>
                  </div>
                } @else {
                  <div class="pt-2 text-xs text-outline flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-emerald-600">verified</span>
                    <span>Registro completado a las {{ turnoCarlos().registroHoraConfirmado || '08:58 hrs' }}</span>
                  </div>
                }
              </div>

              <!-- Turno 2: 09:00 Mariana Gómez (Realizada) -->
              <div class="rounded-2xl p-4 sm:p-5 bg-surface-container-low border border-outline-variant/40 space-y-2 opacity-90">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-sm text-on-surface px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40">
                      09:00 - 09:30
                    </span>
                    <span class="text-xs font-semibold text-outline">Turno 2</span>
                  </div>

                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">done_all</span>
                    <span>Realizada (09:32 hrs)</span>
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base">
                      Mariana Gómez
                    </h4>
                    <p class="text-xs text-on-surface-variant">
                      CC 52.341.908 · EPS Demo B
                    </p>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">
                    MG
                  </div>
                </div>
              </div>

              <!-- Turno 3: 10:00 Jorge Eliécer Ruiz (Confirmada en sala) -->
              <div class="rounded-2xl p-4 sm:p-5 bg-surface-container-lowest border border-primary/40 shadow-xs space-y-3">
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-bold text-sm text-primary px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed">
                      10:00 - 10:30
                    </span>
                    <span class="text-xs font-semibold text-primary">Siguiente Turno</span>
                  </div>

                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span>En espera en sala de recepción</span>
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-title-md font-bold text-on-surface text-base">
                      Jorge Eliécer Ruiz
                    </h4>
                    <p class="text-xs text-on-surface-variant">
                      CC 91.240.112 · Plan Demo 1
                    </p>
                  </div>
                  <div class="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">
                    JR
                  </div>
                </div>

                <div class="pt-2 border-t border-outline-variant/30 flex items-center justify-end">
                  <button
                    type="button"
                    (click)="llamarPaciente('Jorge Eliécer Ruiz')"
                    class="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-base">campaign</span>
                    <span>Llamar a Consultorio 204</span>
                  </button>
                </div>
              </div>

              <!-- Bloque 4: 10:30 - 12:00 Bloque de disponibilidad publicado -->
              <div class="rounded-2xl p-4 bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-700 text-lg">event_available</span>
                    <span class="font-bold text-xs text-emerald-900">
                      10:30 - 12:00 · Bloque de disponibilidad publicado
                    </span>
                  </div>
                  <span class="text-[11px] font-bold text-emerald-800 bg-white/70 px-2 py-0.5 rounded-md border border-emerald-300">
                    3 franjas de 30 min libres
                  </span>
                </div>
                <p class="text-xs text-emerald-800 leading-snug">
                  Habilitado en el catálogo abierto FCV para asignación directa por pacientes ambulatorios.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Gestión de Disponibilidad Rápida (5 cols) -->
        <div class="lg:col-span-5 space-y-5">
          <!-- Formulario de Publicación de Franjas (HU-023) -->
          <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs space-y-4">
            <div class="pb-3 border-b border-outline-variant/30">
              <div class="flex items-center gap-2 text-primary">
                <span class="material-symbols-outlined text-2xl">more_time</span>
                <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                  Gestión Rápida de Disponibilidad
                </h3>
              </div>
              <span class="text-xs text-on-surface-variant font-medium mt-0.5 block">
                Publicar nuevos bloques de atención médica (HU-023)
              </span>
            </div>

            <div class="space-y-3.5 text-xs">
              <div>
                <label for="input-prof-fecha" class="block font-semibold text-on-surface mb-1">Fecha de atención</label>
                <input
                  type="date"
                  id="input-prof-fecha"
                  #availDate
                  value="2024-04-25"
                  class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
                />
              </div>

              <div>
                <label for="input-prof-sede" class="block font-semibold text-on-surface mb-1">Sede y consultorio asignado</label>
                <input
                  type="text"
                  id="input-prof-sede"
                  value="Sede Norte · Consultorio 204"
                  readonly
                  class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs text-on-surface-variant"
                />
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label for="input-prof-hora-inicio" class="block font-semibold text-on-surface mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    id="input-prof-hora-inicio"
                    #availStart
                    value="14:00"
                    class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label for="input-prof-hora-fin" class="block font-semibold text-on-surface mb-1">Hora Fin</label>
                  <input
                    type="time"
                    id="input-prof-hora-fin"
                    #availEnd
                    value="17:00"
                    class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-surface-container-low text-[11px] text-on-surface-variant leading-relaxed">
                Los bloques se dividen automáticamente en franjas continuas de <strong>30 minutos</strong> según la parametrización de Medicina General.
              </div>

              <button
                type="button"
                id="btn-publicar-disponibilidad"
                (click)="publicarDisponibilidad(availDate.value, availStart.value, availEnd.value)"
                class="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">event_available</span>
                <span>Publicar Bloque de Horarios</span>
              </button>
            </div>
          </div>

          <!-- Próximas Jornadas Habilitadas -->
          <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs space-y-3">
            <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base">
              Próximas Jornadas Habilitadas
            </h4>
            <div class="space-y-2.5 text-xs">
              <div class="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <span class="font-bold text-on-surface block">Jueves, 25 Abr 2024</span>
                  <span class="text-on-surface-variant">14:00 - 17:00 (6 franjas)</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Habilitado
                </span>
              </div>
              <div class="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <span class="font-bold text-on-surface block">Viernes, 26 Abr 2024</span>
                  <span class="text-on-surface-variant">08:00 - 12:00 (8 franjas)</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Habilitado
                </span>
              </div>
              <div class="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <span class="font-bold text-on-surface block">Lunes, 29 Abr 2024</span>
                  <span class="text-on-surface-variant">08:00 - 12:00 (8 franjas)</span>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Habilitado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MiAgendaPage {
  readonly fcvService = inject(FcvDataService);

  readonly agendaView = signal<'dia' | 'semana'>('dia');

  turnoCarlos() {
    return this.fcvService.citas()[0];
  }

  atendidasCount() {
    return this.turnoCarlos().estado === 'Realizada' ? 2 : 1;
  }

  marcarAsistencia(citaId: string, estado: 'realizada' | 'inasistencia') {
    this.fcvService.marcarAsistencia(citaId, estado);
  }

  llamarPaciente(nombre: string) {
    this.fcvService.showToast(
      'Paciente anunciado',
      `Se emitió llamado al turno de ${nombre} en pantalla de recepción.`,
      'campaign'
    );
  }

  publicarDisponibilidad(fecha: string, start: string, end: string) {
    this.fcvService.publicarBloqueHorario({
      fecha,
      horaInicio: start,
      horaFin: end,
      sede: 'Sede Norte Cons. 204',
    });
  }
}
