import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FcvDataService } from '../../services/fcv-data.service';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (fcvService.toast().show) {
      <div
        id="toast-notification"
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border transition-all duration-300 transform translate-y-0"
        [class]="fcvService.toast().type === 'error'
          ? 'bg-error-container text-on-error-container border-error/30'
          : 'bg-primary text-on-primary border-primary-container shadow-primary/20'"
        role="alert"
      >
        <span class="material-symbols-outlined text-2xl shrink-0">
          {{ fcvService.toast().icon }}
        </span>
        <div class="flex flex-col text-left pr-2">
          <span class="font-title-md font-semibold text-sm leading-tight">
            {{ fcvService.toast().title }}
          </span>
          <span class="text-xs opacity-90 leading-normal mt-0.5">
            {{ fcvService.toast().message }}
          </span>
        </div>
        <button
          type="button"
          (click)="fcvService.hideToast()"
          class="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors ml-2"
          aria-label="Cerrar notificación"
        >
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    }
  `,
})
export class ToastComponent {
  readonly fcvService = inject(FcvDataService);
}
