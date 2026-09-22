import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FcvDataService } from '../../services/fcv-data.service';
import { UserRole } from '../../models/fcv.models';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header
      id="app-top-header"
      class="sticky top-0 z-30 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-6 flex items-center justify-between"
    >
      <!-- Left side: Hamburger button + Institutional Pill -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          (click)="toggleSidebar.emit()"
          class="p-2 -ml-2 rounded-xl text-on-surface-variant hover:bg-surface-container lg:hidden"
          aria-label="Abrir navegación"
        >
          <span class="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium border border-outline-variant/40">
          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
          <span>Prototipo académico · Datos ficticios</span>
        </div>
      </div>

      <!-- Right side: Quick Perspective Switcher + User Profile -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Interactive Role Switcher for seamless testing -->
        <div class="hidden md:flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/40 text-xs">
          <span class="px-2 text-[11px] font-semibold text-outline uppercase tracking-wider">
            Vista:
          </span>
          <button
            type="button"
            id="role-switch-user"
            (click)="selectRole('USER', '/paciente/inicio')"
            [class]="fcvService.currentUser().role === 'USER'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-2.5 py-1 rounded-lg transition-colors"
          >
            Paciente
          </button>
          <button
            type="button"
            id="role-switch-prof"
            (click)="selectRole('PROFESSIONAL', '/profesional/mi-agenda')"
            [class]="fcvService.currentUser().role === 'PROFESSIONAL'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-2.5 py-1 rounded-lg transition-colors"
          >
            Médico
          </button>
          <button
            type="button"
            id="role-switch-admin"
            (click)="selectRole('ADMIN', '/administrador/solicitudes')"
            [class]="fcvService.currentUser().role === 'ADMIN'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'"
            class="px-2.5 py-1 rounded-lg transition-colors"
          >
            Administrador
          </button>
        </div>

        <!-- User Information Chip -->
        <div class="flex items-center gap-3 pl-2 sm:pl-3 border-l border-outline-variant/40">
          <div class="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center border border-white/20">
            {{ fcvService.currentUser().avatarText }}
          </div>
          <div class="hidden sm:block text-left">
            <span class="text-xs font-bold text-on-surface block leading-tight">
              {{ fcvService.currentUser().name }}
            </span>
            <span class="text-[10px] font-semibold text-primary block leading-tight">
              {{ fcvService.currentUser().roleTitle }}
            </span>
          </div>
          <a
            id="btn-logout"
            routerLink="/login"
            class="p-2 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
            title="Cerrar sesión / Ir a Login"
            aria-label="Cerrar sesión"
          >
            <span class="material-symbols-outlined text-xl">logout</span>
          </a>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly fcvService = inject(FcvDataService);
  private readonly router = inject(Router);
  readonly toggleSidebar = output<void>();

  selectRole(role: UserRole, targetRoute: string) {
    this.fcvService.switchUserRole(role);
    this.router.navigateByUrl(targetRoute);
  }
}
