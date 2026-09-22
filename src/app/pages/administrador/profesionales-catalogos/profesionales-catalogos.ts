import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FcvDataService } from '../../../services/fcv-data.service';
import { ProfesionalSalud } from '../../../models/fcv.models';

@Component({
  selector: 'app-profesionales-catalogos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="space-y-6">
      <!-- Breadcrumb y Encabezado con Botón de Creación -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav class="flex items-center gap-1.5 text-xs text-outline mb-1" aria-label="Ruta de navegación">
            <span>Administración Clínica</span>
            <span class="material-symbols-outlined text-xs">chevron_right</span>
            <span class="text-on-surface font-semibold">Profesionales y Catálogos</span>
          </nav>
          <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Directorio de Profesionales y Catálogos
          </h1>
          <p class="text-xs text-on-surface-variant mt-1">
            Gestión del cuerpo asistencial docente, parametrización de duraciones y catálogo institucional (HU-008).
          </p>
        </div>

        <button
          type="button"
          id="btn-nuevo-profesional"
          (click)="showCreateModal.set(true)"
          class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-base">person_add</span>
          <span>+ Nuevo profesional de salud</span>
        </button>
      </div>

      <!-- Tarjetas de Métricas Institucionales (4 columnas) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div class="flex items-center justify-between text-outline text-xs mb-1">
            <span>Médicos Activos</span>
            <span class="material-symbols-outlined text-emerald-600">medical_services</span>
          </div>
          <span class="font-headline-sm text-2xl font-bold text-on-surface block">
            {{ activosCount() }}/{{ fcvService.profesionales().length }}
          </span>
          <span class="text-[11px] text-emerald-700 font-semibold">Cuerpo docente disponible</span>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div class="flex items-center justify-between text-outline text-xs mb-1">
            <span>Especialidades FCV</span>
            <span class="material-symbols-outlined text-primary">clinical_notes</span>
          </div>
          <span class="font-headline-sm text-2xl font-bold text-on-surface block">
            {{ fcvService.especialidades().length }} Áreas
          </span>
          <span class="text-[11px] text-on-surface-variant">General & Subespecialidades</span>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div class="flex items-center justify-between text-outline text-xs mb-1">
            <span>Sedes Operativas</span>
            <span class="material-symbols-outlined text-secondary">apartment</span>
          </div>
          <span class="font-headline-sm text-2xl font-bold text-on-surface block">
            {{ fcvService.sedes().length }} Fijas
          </span>
          <span class="text-[11px] text-on-surface-variant">Floridablanca & Bucaramanga</span>
        </div>

        <div class="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs">
          <div class="flex items-center justify-between text-outline text-xs mb-1">
            <span>EPS Habilitadas</span>
            <span class="material-symbols-outlined text-outline">domain</span>
          </div>
          <span class="font-headline-sm text-2xl font-bold text-on-surface block">
            {{ fcvService.epsList().length }} Entidades
          </span>
          <span class="text-[11px] text-on-surface-variant">3 Planes configurados</span>
        </div>
      </div>

      <!-- Directorio de Profesionales Asistenciales (Tabla) -->
      <div class="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="font-title-md font-bold text-on-surface text-base">
              Directorio de Profesionales Asistenciales
            </h3>
            <p class="text-xs text-on-surface-variant">
              Registro nominal de credenciales sintéticas, especialidad asignada y sedes físicas.
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-container-low text-outline uppercase text-[11px] font-bold border-b border-outline-variant/30">
              <tr>
                <th class="py-3 px-4">Código & Profesional</th>
                <th class="py-3 px-4">Registro Médico</th>
                <th class="py-3 px-4">Especialidad Principal</th>
                <th class="py-3 px-4">Sedes Autorizadas</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              @for (prof of fcvService.profesionales(); track prof.codigo) {
                <tr class="hover:bg-surface-container-low/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
                        {{ prof.nombre.substring(prof.nombre.indexOf(' ') + 1, prof.nombre.indexOf(' ') + 3) }}
                      </div>
                      <div>
                        <span class="font-mono text-primary font-bold text-[11px] block">{{ prof.codigo }}</span>
                        <span class="font-bold text-on-surface text-sm block">{{ prof.nombre }}</span>
                        <span class="text-outline text-[11px]">{{ prof.email }}</span>
                      </div>
                    </div>
                  </td>

                  <td class="py-3.5 px-4">
                    <span class="font-mono font-semibold text-on-surface block">{{ prof.registroSintetico }}</span>
                    <span class="text-outline text-[11px]">Validado Colegio Médico</span>
                  </td>

                  <td class="py-3.5 px-4">
                    <span class="font-semibold text-on-surface block">{{ prof.especialidadPrincipal }}</span>
                    <span class="text-outline text-[11px]">{{ prof.duracionMin }} min por consulta</span>
                  </td>

                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      @for (sede of prof.sedes; track sede) {
                        <span class="px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-medium text-[11px]">
                          {{ sede }}
                        </span>
                      }
                    </div>
                  </td>

                  <td class="py-3.5 px-4">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1"
                      [class]="prof.estado === 'Activo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-container-high text-outline'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [class]="prof.estado === 'Activo' ? 'bg-emerald-600' : 'bg-outline'"></span>
                      <span>{{ prof.estado }}</span>
                    </span>
                  </td>

                  <td class="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      (click)="toggleEstado(prof)"
                      class="px-2.5 py-1 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      {{ prof.estado === 'Activo' ? 'Inactivar' : 'Activar' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Parámetros Operativos del Sistema (Grid de 3 módulos) -->
      <div>
        <h3 class="font-title-lg font-bold text-on-surface text-lg mb-4">
          Parámetros Operativos del Sistema
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Card 1: Especialidades Médicas y Tiempos de Consulta -->
          <div class="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-3">
            <div class="flex items-center gap-2 text-primary pb-2 border-b border-outline-variant/30">
              <span class="material-symbols-outlined text-xl">timer</span>
              <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base">
                Especialidades y Duraciones
              </h4>
            </div>

            <div class="space-y-2 text-xs">
              @for (esp of fcvService.especialidades(); track esp.codigo) {
                <div class="p-2.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                  <div>
                    <span class="font-bold text-on-surface block">{{ esp.nombre }}</span>
                    <span class="text-outline text-[11px]">{{ esp.subtitulo }}</span>
                  </div>
                  <span class="font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-surface-container-lowest">
                    {{ esp.duracionMin }}m
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Card 2: Aseguradoras EPS y Planes -->
          <div class="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-3">
            <div class="flex items-center gap-2 text-primary pb-2 border-b border-outline-variant/30">
              <span class="material-symbols-outlined text-xl">health_and_safety</span>
              <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base">
                Aseguradoras EPS y Planes
              </h4>
            </div>

            <div class="space-y-2.5 text-xs">
              @for (eps of fcvService.epsList(); track eps.codigo) {
                <div class="p-3 rounded-2xl bg-surface-container-low space-y-1.5">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-on-surface">{{ eps.nombre }}</span>
                    <span class="text-outline font-mono text-[11px]">{{ eps.codigo }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    @for (plan of eps.planes; track plan) {
                      <span class="px-2 py-0.5 rounded-md bg-surface-container-lowest text-primary text-[11px] font-medium border border-outline-variant/30">
                        {{ plan }}
                      </span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Card 3: Catálogos Fijos y Máquina de Estados -->
          <div class="p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs space-y-3">
            <div class="flex items-center gap-2 text-primary pb-2 border-b border-outline-variant/30">
              <span class="material-symbols-outlined text-xl">account_tree</span>
              <h4 class="font-title-md font-bold text-on-surface text-sm sm:text-base">
                Catálogos Fijos Institucionales
              </h4>
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-2.5 rounded-xl bg-surface-container-low">
                <span class="text-[10px] font-bold uppercase text-outline block">Sedes Físicas:</span>
                <span class="font-semibold text-on-surface">LOC-01 (Sede Norte) · LOC-02 (Sede Sur)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-surface-container-low">
                <span class="text-[10px] font-bold uppercase text-outline block">Roles de Seguridad RBAC:</span>
                <span class="font-semibold text-on-surface">USER, PROFESSIONAL, ADMIN</span>
              </div>
              <div class="p-2.5 rounded-xl bg-surface-container-low">
                <span class="text-[10px] font-bold uppercase text-outline block">Estados de Cita:</span>
                <span class="font-mono text-[11px] text-primary">REQUESTED · APPROVED · REJECTED · CANCELLED · COMPLETED · NO_SHOW</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Registro de Nuevo Profesional (HU-008) -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div class="w-full max-w-lg bg-surface-container-lowest rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-variant/40 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div class="flex items-center gap-2.5">
                <span class="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 class="font-title-lg font-bold text-on-surface text-base sm:text-lg">
                  Nuevo Profesional de Salud (HU-008)
                </h3>
              </div>
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <label for="input-prof-nombre" class="block font-semibold text-on-surface mb-1">Nombre Completo del Profesional</label>
                <input
                  type="text"
                  id="input-prof-nombre"
                  #pNombre
                  placeholder="Ej: Dr. Fernando Galvis"
                  class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label for="input-prof-reg" class="block font-semibold text-on-surface mb-1">Registro Médico Sintético</label>
                  <input
                    type="text"
                    id="input-prof-reg"
                    #pReg
                    placeholder="Reg. FCV-77120"
                    class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label for="select-prof-esp" class="block font-semibold text-on-surface mb-1">Especialidad</label>
                  <select id="select-prof-esp" #pEsp class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs">
                    <option value="Medicina General (30 min)">Medicina General (30 min)</option>
                    <option value="Cardiología (60 min)">Cardiología (60 min)</option>
                    <option value="Dermatología (60 min)">Dermatología (60 min)</option>
                    <option value="Neurología Clínica (45 min)">Neurología (45 min)</option>
                  </select>
                </div>
              </div>

              <fieldset>
                <legend class="block font-semibold text-on-surface mb-1">Sedes Asistenciales Asignadas</legend>
                <div class="flex items-center gap-4 pt-1">
                  <label for="check-sede-norte" class="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input type="checkbox" id="check-sede-norte" #checkNorte checked class="rounded border-outline-variant text-primary" />
                    <span>Sede Norte (Floridablanca)</span>
                  </label>
                  <label for="check-sede-sur" class="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input type="checkbox" id="check-sede-sur" #checkSur class="rounded border-outline-variant text-primary" />
                    <span>Sede Sur (Bucaramanga)</span>
                  </label>
                </div>
              </fieldset>
            </div>

            <div class="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="guardarProfesional(pNombre.value, pReg.value, pEsp.value, checkNorte.checked, checkSur.checked)"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Guardar Profesional
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProfesionalesCatalogosPage {
  readonly fcvService = inject(FcvDataService);

  readonly showCreateModal = signal<boolean>(false);

  activosCount() {
    return this.fcvService.profesionales().filter((p) => p.estado === 'Activo').length;
  }

  toggleEstado(prof: ProfesionalSalud) {
    const nuevo = prof.estado === 'Activo' ? 'Inactivo' : 'Activo';
    this.fcvService.profesionales.update((list) =>
      list.map((p) => (p.codigo === prof.codigo ? { ...p, estado: nuevo } : p))
    );
    this.fcvService.showToast('Estado actualizado', `${prof.nombre} ahora está ${nuevo}.`, 'tune');
  }

  guardarProfesional(nombre: string, reg: string, esp: string, norte: boolean, sur: boolean) {
    if (!nombre) {
      this.fcvService.showToast('Campo requerido', 'Debe ingresar el nombre del profesional.', 'error', 'error');
      return;
    }

    const sedes: string[] = [];
    if (norte) sedes.push('Sede Norte');
    if (sur) sedes.push('Sede Sur');

    const dur = esp.includes('60') ? 60 : esp.includes('45') ? 45 : 30;

    this.fcvService.agregarProfesional({
      nombre,
      registroSintetico: reg,
      especialidadPrincipal: esp,
      duracionMin: dur,
      sedes,
    });

    this.showCreateModal.set(false);
  }
}
