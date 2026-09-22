import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FcvDataService } from '../../../services/fcv-data.service';

interface SlotDisponibilidad {
  id: string;
  profesionalNombre: string;
  profesionalSubtitulo: string;
  registro: string;
  especialidad: string;
  tipo: 'general' | 'especializada';
  duracionMin: number;
  sede: string;
  consultorio: string;
  fechaTexto: string;
  fechaIso: string;
  hora: string;
  cupoStatus: 'Libre' | 'Último Cupo';
  foto: string;
  disponible: boolean;
}

@Component({
  selector: 'app-buscar-disponibilidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb & Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Portal Paciente</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Buscar Disponibilidad</span>
          </nav>
          <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Buscar Disponibilidad y Agendamiento
          </h1>
        </div>

        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>48 cupos activos hoy en Bucaramanga y Floridablanca</span>
        </div>
      </div>

      <!-- Panel de Control de Filtros Asistenciales -->
      <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 shadow-xs">
        <div class="flex items-center gap-2 mb-4">
          <span class="material-symbols-outlined text-primary text-xl">tune</span>
          <h2 class="font-title-md font-bold text-on-surface text-base">
            Filtros de Búsqueda Ambulatoria
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Sede Hospitalaria -->
          <div>
            <label for="select-filtro-sede" class="block text-xs font-semibold text-on-surface mb-1.5">Sede Hospitalaria</label>
            <select
              id="select-filtro-sede"
              #sedeFilter
              (change)="selectedSede.set(sedeFilter.value)"
              class="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="todas">Todas las sedes</option>
              <option value="Sede Norte">Sede Norte (Floridablanca)</option>
              <option value="Sede Sur">Sede Sur (Bucaramanga)</option>
            </select>
          </div>

          <!-- Especialidad Médica -->
          <div>
            <label for="select-filtro-esp" class="block text-xs font-semibold text-on-surface mb-1.5">Especialidad Médica</label>
            <select
              id="select-filtro-esp"
              #espFilter
              (change)="selectedEspecialidad.set(espFilter.value)"
              class="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="todas">Todas las especialidades</option>
              <option value="Medicina General">Medicina General (30 min)</option>
              <option value="Cardiología">Cardiología Adultos (60 min)</option>
              <option value="Dermatología">Dermatología Clínica (60 min)</option>
            </select>
          </div>

          <!-- Fecha Preferida -->
          <div>
            <label for="input-filtro-fecha" class="block text-xs font-semibold text-on-surface mb-1.5">Fecha Preferida</label>
            <input
              type="date"
              id="input-filtro-fecha"
              #fechaFilter
              value="2024-04-24"
              class="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <!-- Botón de Filtrar -->
          <div class="flex items-end">
            <button
              type="button"
              (click)="aplicarFiltros()"
              class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span class="material-symbols-outlined text-base">search</span>
              <span>Filtrar disponibilidad</span>
            </button>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between text-xs text-on-surface-variant gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-primary">verified</span>
            <span>Medicina General: Aprobación inmediata (HU-017)</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-sm text-amber-600">pending</span>
            <span>Especialidades: Requieren validación docente / administrativa</span>
          </div>
        </div>
      </div>

      <!-- Grilla de Profesionales y Franjas Disponibles -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">calendar_today</span>
            <h3 class="font-title-lg font-bold text-on-surface text-lg">
              Franjas de Atención Disponibles ({{ filteredSlots().length }} encontradas)
            </h3>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (slot of filteredSlots(); track slot.id) {
            <div class="rounded-3xl bg-surface-container-lowest p-5 border border-outline-variant/40 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
              <div>
                <!-- Status Badge & Duration -->
                <div class="flex items-center justify-between mb-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                    [class]="slot.cupoStatus === 'Libre'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'"
                  >
                    {{ slot.cupoStatus }}
                  </span>
                  <span class="text-xs font-semibold text-outline">
                    {{ slot.duracionMin }} min de consulta
                  </span>
                </div>

                <!-- Professional Photo & Bio -->
                <div class="flex items-center gap-3.5 mb-4">
                  <img
                    [src]="slot.foto"
                    [alt]="slot.profesionalNombre"
                    referrerpolicy="no-referrer"
                    class="w-14 h-14 rounded-2xl object-cover border border-outline-variant/40 shadow-xs shrink-0"
                  />
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-primary block">
                      {{ slot.especialidad }}
                    </span>
                    <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base leading-snug">
                      {{ slot.profesionalNombre }}
                    </h4>
                    <span class="text-xs text-on-surface-variant block mt-0.5">
                      {{ slot.profesionalSubtitulo }}
                    </span>
                  </div>
                </div>

                <!-- Campus, Room & Time Details -->
                <div class="p-3 rounded-2xl bg-surface-container-low text-xs space-y-2 mb-4">
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Sede:</span>
                    <span class="font-bold text-on-surface">{{ slot.sede }} ({{ slot.consultorio }})</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-outline">Horario disponible:</span>
                    <span class="font-bold text-primary">{{ slot.fechaTexto }} · {{ slot.hora }}</span>
                  </div>
                </div>

                @if (slot.tipo === 'especializada') {
                  <p class="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 mb-4 leading-tight">
                    Requiere 2 franjas contiguas asignadas. Sujeta a validación administrativa posterior.
                  </p>
                }
              </div>

              <!-- Action Button -->
              <button
                type="button"
                id="btn-select-slot-{{ slot.id }}"
                (click)="openBookingModal(slot)"
                class="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Seleccionar y Agendar</span>
                <span class="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Sección de Información Campus & PBX -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        <!-- Tarjeta de Llegada y Admisión con Fotografía del Campus FCV -->
        <div class="rounded-3xl bg-surface-container-lowest overflow-hidden border border-outline-variant/40 shadow-xs flex flex-col">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw5wJ8q_ZR99jTujWflfnM4gkAOTMS0d1KdDEd-ykz3TLVnsSkez8Dn68vLhK6IqlGkesjIAtLCDylh9U5sarArW9y9B0pwqutDcSKFog7vs88ffrviIYa5ulIRxiNlF3IeegABIidv9qbhD5gWieJ_UUYc1wfNTo7XkqMJmQBunclnctVrjFrKOAm_6d5jcmGNYdEQcrHqxk-GnX4tLBsf35ccvBSej_D2wAUvNF6ilYELKwVn4Y2ug"
            alt="Campus Hospital Universitario FCV"
            referrerpolicy="no-referrer"
            class="w-full h-44 object-cover"
          />
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h4 class="font-title-md font-bold text-on-surface text-base mb-1">
                Llegada y Admisión en Sedes Universitarias
              </h4>
              <p class="text-xs text-on-surface-variant leading-relaxed">
                Presente su documento de identidad original en los módulos biométricos del primer piso con al menos 15 minutos de antelación.
              </p>
            </div>
            <div class="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
              <span class="material-symbols-outlined text-base">directions</span>
              <span>Sede Floridablanca & Sede Bucaramanga</span>
            </div>
          </div>
        </div>

        <!-- Tarjeta PBX & Asistencia Médica -->
        <div class="rounded-3xl bg-primary text-on-primary p-6 shadow-xs border border-primary-container flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <span class="material-symbols-outlined text-2xl text-on-primary">support_agent</span>
            </div>
            <h4 class="font-headline-sm text-lg font-bold text-white mb-2">
              Línea de Asistencia y Asignación FCV
            </h4>
            <p class="text-xs text-white/80 leading-relaxed mb-4">
              Si no encuentra disponibilidad para la subespecialidad requerida o requiere autorización EPS prioritaria, comuníquese con el conmutador asistencial central.
            </p>
            <div class="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1">
              <span class="text-[11px] uppercase tracking-wider text-white/70 block font-semibold">PBX Conmutador Central:</span>
              <p class="font-mono font-bold text-base text-white">(607) 639-4000 Ext. 1024 / 1025</p>
              <p class="text-[11px] text-white/70">Atención telefónica de Lunes a Viernes de 07:00 a 19:00 hrs.</p>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-white/15 text-[11px] text-white/60">
            Hospital Universitario de la Fundación Cardiovascular de Colombia
          </div>
        </div>
      </div>

      <!-- Modal de 4 Etapas: Agendamiento Guiado (HU-017) -->
      @if (bookingSlot()) {
        @let s = bookingSlot();
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div class="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-variant/40 space-y-5">
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
                  <span class="material-symbols-outlined text-xl">event_available</span>
                </div>
                <div>
                  <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                    Agendamiento de Cita Médica
                  </h3>
                  <span class="text-xs text-on-surface-variant font-medium">
                    Proceso guiado de 4 etapas asistenciales (HU-017)
                  </span>
                </div>
              </div>
              <button
                type="button"
                (click)="bookingSlot.set(null)"
                class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <!-- 4 Stage Visual Steps Indicator -->
            <div class="grid grid-cols-4 gap-2 text-center text-xs">
              <div class="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold">
                1. Especialidad
              </div>
              <div class="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold">
                2. Profesional
              </div>
              <div class="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed font-bold">
                3. Franja
              </div>
              <div class="p-2 rounded-xl bg-primary text-on-primary font-bold">
                4. Confirmar
              </div>
            </div>

            <!-- Resumen de Datos de la Cita -->
            <div class="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-outline">Paciente:</span>
                <span class="font-bold text-on-surface">
                  {{ fcvService.currentUser().name }} ({{ fcvService.currentUser().documento }})
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-outline">Especialidad:</span>
                <span class="font-bold text-primary">{{ s?.especialidad }} ({{ s?.duracionMin }} min)</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-outline">Profesional Asignado:</span>
                <span class="font-semibold text-on-surface">{{ s?.profesionalNombre }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-outline">Sede & Consultorio:</span>
                <span class="font-semibold text-on-surface">{{ s?.sede }} · {{ s?.consultorio }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-outline">Fecha & Hora:</span>
                <span class="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {{ s?.fechaTexto }} · {{ s?.hora }}
                </span>
              </div>
            </div>

            <!-- Explicación de Política Asistencial -->
            @if (s?.tipo === 'general') {
              <div class="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2.5">
                <span class="material-symbols-outlined text-emerald-700 text-xl shrink-0 mt-0.5">verified</span>
                <div>
                  <span class="font-bold block">Aprobación Inmediata de Medicina General</span>
                  <p class="text-[11px] text-emerald-800 leading-snug">
                    Por ser consulta general de primer nivel ambulatorio, su cita quedará inmediatamente confirmada con radicado único.
                  </p>
                </div>
              </div>
            } @else {
              <div class="p-3.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-2.5">
                <span class="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">pending_actions</span>
                <div>
                  <span class="font-bold block">Interconsulta Especializada (Revisión Administrativa)</span>
                  <p class="text-[11px] text-amber-800 leading-snug">
                    Esta solicitud requiere validación del comité asistencial para verificación de orden médica previa y pertinencia.
                  </p>
                </div>
              </div>
            }

            <!-- Checkbox de Consentimiento -->
            <label class="flex items-start gap-2 text-xs text-on-surface cursor-pointer">
              <input
                type="checkbox"
                #consentCheck
                checked
                class="mt-0.5 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>
                Confirmo que los datos asistenciales son correctos y me comprometo a asistir puntualmente o notificar con 24 horas de antelación.
              </span>
            </label>

            <!-- Acciones del Modal -->
            <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                (click)="bookingSlot.set(null)"
                class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                id="btn-confirm-appointment"
                (click)="confirmarAgendamiento(s!, consentCheck.checked)"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">check_circle</span>
                <span>Confirmar Agendamiento</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class BuscarDisponibilidadPage {
  readonly fcvService = inject(FcvDataService);
  private readonly router = inject(Router);

  readonly selectedSede = signal<string>('todas');
  readonly selectedEspecialidad = signal<string>('todas');
  readonly bookingSlot = signal<SlotDisponibilidad | null>(null);

  readonly allSlots = signal<SlotDisponibilidad[]>([
    {
      id: 'slot-1',
      profesionalNombre: 'Dr. Roberto Silva Morales',
      profesionalSubtitulo: 'Especialista Docente · Reg. FCV-40912',
      registro: 'Reg. FCV-40912',
      especialidad: 'Medicina General',
      tipo: 'general',
      duracionMin: 30,
      sede: 'Sede Norte',
      consultorio: 'Cons. 302',
      fechaTexto: 'Mié, 24 Abr 2024',
      fechaIso: '2024-04-24',
      hora: '09:00 - 09:30',
      cupoStatus: 'Libre',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFjQAkkbMUj_lB3J_i3-6G2qrOdWSq05Odk43WMsFUizXGVw6EgkSHM0dsKai5gFDru9SffV_9ByOT-DG8Ef06-6aD6t4i9NNammEXZoKrCeJNXm9sO5Fv7Zr91OBOLUPudC3HRp49n75j-LFoHaWnS0iRBye3QQ0zF15nVDKD_13pzw-VCRPQsMeOITYYx9g17cCrowgZ4dtj1H6MumwTuSZoahVz4-HlZSF0Lhmjwqr99YCW6XQU7Q',
      disponible: true,
    },
    {
      id: 'slot-2',
      profesionalNombre: 'Dra. Claudia Restrepo',
      profesionalSubtitulo: 'Médica General · Reg. FCV-38821',
      registro: 'Reg. FCV-38821',
      especialidad: 'Medicina General',
      tipo: 'general',
      duracionMin: 30,
      sede: 'Sede Norte',
      consultorio: 'Cons. 308',
      fechaTexto: 'Mié, 24 Abr 2024',
      fechaIso: '2024-04-24',
      hora: '10:30 - 11:00',
      cupoStatus: 'Libre',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqSA-QTKqXSIZ0UUXlZQ2bsVqVYWUBlofzNwKxejH2y3uxaGUvEFfLSZbIid8tHTAU-1bpHfSDxHrshUhnX41XARg2IhgE-TBiYd2cblMy3BrwzwNqa0z7kjN62abtJHjcOE_piE7q3pasUmNSOhwVpwHoKtmE8vF9pXo6grGg-A5uPXkfF1rZqUL23CgSUN29cODRU4Q1JApXJtuJiRi6lLFEi2hZN_2un6_swaXKuhTirgZxaBdtkA',
      disponible: true,
    },
    {
      id: 'slot-3',
      profesionalNombre: 'Dra. María Elena Torres',
      profesionalSubtitulo: 'Cardióloga Electrofisióloga · Espec. Reg. FCV-99120',
      registro: 'Reg. FCV-99120',
      especialidad: 'Cardiología',
      tipo: 'especializada',
      duracionMin: 60,
      sede: 'Sede Sur',
      consultorio: 'Pabellón Cardio B · Cons. 402',
      fechaTexto: 'Jue, 25 Abr 2024',
      fechaIso: '2024-04-25',
      hora: '10:00 - 11:00',
      cupoStatus: 'Último Cupo',
      foto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTit01jSVa06L3U9v0RKn-plgLdd9pINdQa4f2cZ6IhCCW24cKDmyOZZoFcPBbVrJBU_mnjjxfSXly7h14zC7-nLz3WQQd8u-1GoWDOh2BWevnmqZFoqB-eRBLPnUnjmlrrDazzDOcbv2lFsfWnfI6vUbbir8sIp8u3P5cmIe17MQ0ez50MAiKi_sR_JshkSSNGSniifa_yzWrB6v3MeqP36RJu4TLv7tNtpvt74PeiUxsWFbTNRYu4g',
      disponible: true,
    },
  ]);

  filteredSlots() {
    return this.allSlots().filter((slot) => {
      const matchSede = this.selectedSede() === 'todas' || slot.sede.toLowerCase().includes(this.selectedSede().toLowerCase());
      const matchEsp = this.selectedEspecialidad() === 'todas' || slot.especialidad.toLowerCase().includes(this.selectedEspecialidad().toLowerCase());
      return matchSede && matchEsp;
    });
  }

  aplicarFiltros() {
    this.fcvService.showToast('Filtros aplicados', 'Se actualizaron las franjas según los criterios seleccionados.', 'search');
  }

  openBookingModal(slot: SlotDisponibilidad) {
    this.bookingSlot.set(slot);
  }

  confirmarAgendamiento(slot: SlotDisponibilidad, consent: boolean) {
    if (!consent) {
      this.fcvService.showToast('Requisito', 'Debe aceptar los términos de asistencia para continuar.', 'warning', 'error');
      return;
    }

    this.fcvService.agendarCita({
      especialidad: slot.especialidad,
      profesionalNombre: slot.profesionalNombre,
      sede: slot.sede,
      consultorio: slot.consultorio,
      fechaTexto: slot.fechaTexto,
      fechaIso: slot.fechaIso,
      hora: slot.hora,
      duracionMinutos: slot.duracionMin,
      tipo: slot.tipo,
    });

    this.bookingSlot.set(null);
    this.router.navigateByUrl('/paciente/mis-citas');
  }
}
