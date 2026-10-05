import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Diálogo para registrar un motivo obligatorio (rechazos ADMIN, RN-04 y D-16). */
@Component({
  selector: 'app-reason-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="reason-dialog-title">
        <form class="fcv-card w-full max-w-md space-y-4" (ngSubmit)="submit()">
          <div>
            <h2 id="reason-dialog-title" class="font-bold text-lg">{{ title() }}</h2>
            @if (description()) {
              <p class="text-sm text-outline mt-1">{{ description() }}</p>
            }
          </div>
          <label class="fcv-label">Motivo (obligatorio)
            <textarea id="reason-dialog-text" class="fcv-input" rows="3" maxlength="500" name="reason" [(ngModel)]="reason" required></textarea>
          </label>
          @if (error()) {
            <p class="fcv-alert-error" role="alert">{{ error() }}</p>
          }
          <div class="flex justify-end gap-2">
            <button type="button" class="fcv-btn-ghost" (click)="cancel()">Cancelar</button>
            <button id="reason-dialog-confirm" type="submit" class="fcv-btn-danger">{{ confirmLabel() }}</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class ReasonDialogComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly description = input('');
  readonly confirmLabel = input('Confirmar');
  readonly confirmed = output<string>();
  readonly dismissed = output<void>();
  readonly error = signal('');
  reason = '';

  submit(): void {
    if (!this.reason.trim()) {
      this.error.set('El motivo es obligatorio.');
      return;
    }
    this.confirmed.emit(this.reason.trim());
    this.reset();
  }

  cancel(): void {
    this.reset();
    this.dismissed.emit();
  }

  private reset(): void {
    this.reason = '';
    this.error.set('');
  }
}
