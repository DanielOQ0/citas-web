import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FcvDataService } from '../../services/fcv-data.service';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile backdrop -->
    @if (isOpen()) {
      <button
        type="button"
        id="sidebar-mobile-backdrop"
        class="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40 lg:hidden cursor-default w-full h-full border-none p-0 text-left"
        (click)="closeSidebar.emit()"
        aria-label="Cerrar navegación lateral"
      ></button>
    }

    <aside
      id="main-sidebar"
      class="fixed inset-y-0 left-0 z-40 w-72 bg-surface-container-lowest border-r border-outline-variant/40 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
    >
      <!-- Brand & Identity -->
      <div>
        <div class="px-6 py-6 border-b border-outline-variant/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md shadow-primary/20">
              <span class="material-symbols-outlined text-2xl">local_hospital</span>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-headline-sm text-lg font-bold tracking-tight text-primary">FCV Citas</span>
              </div>
              <span class="text-[11px] font-medium text-on-surface-variant block leading-tight">
                Hospital Universitario FCV
              </span>
            </div>
          </div>
          <button
            type="button"
            class="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant lg:hidden"
            (click)="closeSidebar.emit()"
            aria-label="Cerrar menú"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Navigation Links Grouped by Context -->
        <nav class="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none" aria-label="Navegación principal">
          <!-- SECCIÓN: PACIENTE -->
          <div>
            <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">person</span>
              <span>Portal Paciente</span>
            </div>
            <div class="space-y-1">
              <a
                id="nav-paciente-inicio"
                routerLink="/paciente/inicio"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="closeSidebar.emit()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined text-xl">dashboard</span>
                <span>Resumen de Citas</span>
              </a>
              <a
                id="nav-paciente-buscar"
                routerLink="/paciente/buscar-disponibilidad"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                (click)="closeSidebar.emit()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined text-xl">event_available</span>
                <span>Buscar Disponibilidad</span>
              </a>
              <a
                id="nav-paciente-citas"
                routerLink="/paciente/mis-citas"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                (click)="closeSidebar.emit()"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-xl">calendar_month</span>
                  <span>Mis Citas e Historial</span>
                </div>
                <span class="px-2 py-0.5 text-xs rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                  {{ fcvService.activeAppointmentsCount() }}
                </span>
              </a>
            </div>
          </div>

          <!-- SECCIÓN: PROFESIONAL -->
          <div>
            <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">stethoscope</span>
              <span>Portal Médico</span>
            </div>
            <div class="space-y-1">
              <a
                id="nav-profesional-agenda"
                routerLink="/profesional/mi-agenda"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                (click)="closeSidebar.emit()"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-xl">view_timeline</span>
                  <span>Mi Agenda Asistencial</span>
                </div>
                <span class="px-2 py-0.5 text-xs rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                  Hoy
                </span>
              </a>
            </div>
          </div>

          <!-- SECCIÓN: ADMINISTRADOR -->
          <div>
            <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
              <span class="material-symbols-outlined text-sm">admin_panel_settings</span>
              <span>Administración Clínica</span>
            </div>
            <div class="space-y-1">
              <a
                id="nav-admin-solicitudes"
                routerLink="/administrador/solicitudes"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                (click)="closeSidebar.emit()"
                class="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span class="material-symbols-outlined text-xl">assignment_turned_in</span>
                  <span>Solicitudes y Reprogramación</span>
                </div>
                @if (fcvService.pendingSpecializedAppointments().length + fcvService.pendingReprogramaciones().length > 0) {
                  <span class="px-2 py-0.5 text-xs rounded-full bg-error text-on-error font-bold">
                    {{ fcvService.pendingSpecializedAppointments().length + fcvService.pendingReprogramaciones().length }}
                  </span>
                }
              </a>
              <a
                id="nav-admin-profesionales"
                routerLink="/administrador/profesionales"
                routerLinkActive="bg-primary-fixed text-on-primary-fixed font-semibold"
                (click)="closeSidebar.emit()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span class="material-symbols-outlined text-xl">medical_information</span>
                <span>Profesionales y Catálogos</span>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <!-- Environment & Sandbox Notice Footer -->
      <div class="p-4 border-t border-outline-variant/30 bg-surface-container-low/50">
        <div class="flex items-center gap-2 mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-[11px] font-semibold tracking-wide uppercase text-on-surface-variant">
            Sandbox H2 In-Memory
          </span>
        </div>
        <p class="text-[11px] text-outline leading-snug">
          Entorno Académico FCV · Datos sintéticos demostrativos para validación clínica.
        </p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly fcvService = inject(FcvDataService);
  readonly isOpen = input<boolean>(false);
  readonly closeSidebar = output<void>();
}
