import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar';
import { HeaderComponent } from './header';
import { ToastComponent } from '../toast/toast';

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-surface flex flex-col">
      <app-sidebar [isOpen]="isSidebarOpen()" (closeSidebar)="isSidebarOpen.set(false)" />

      <div class="lg:pl-72 flex flex-col flex-1 min-h-screen">
        <app-header (toggleSidebar)="isSidebarOpen.set(!isSidebarOpen())" />

        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <router-outlet />
        </main>
      </div>

      <app-toast />
    </div>
  `,
})
export class ShellComponent {
  readonly isSidebarOpen = signal<boolean>(false);
}
