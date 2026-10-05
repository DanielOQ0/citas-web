import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

      <!-- Right side: authenticated user (the role comes from the backend session) -->
      <div class="flex items-center gap-3 pl-2 sm:pl-3 border-l border-outline-variant/40">
        <div class="w-9 h-9 rounded-full bg-primary-container text-on-primary-container font-bold text-xs flex items-center justify-center border border-white/20" aria-hidden="true">
          {{ session.initials() }}
        </div>
        <div class="hidden sm:block text-left">
          <span id="session-user-name" class="text-xs font-bold text-on-surface block leading-tight">
            {{ session.user()?.name }}
          </span>
          <span id="session-user-role" class="text-[10px] font-semibold text-primary block leading-tight">
            {{ session.roleTitle() }}
          </span>
        </div>
        <button
          id="btn-logout"
          type="button"
          (click)="session.logout()"
          class="p-2 rounded-xl text-on-surface-variant hover:bg-error-container hover:text-on-error-container transition-colors"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <span class="material-symbols-outlined text-xl">logout</span>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly session = inject(SessionService);
  readonly toggleSidebar = output<void>();
}
