import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HistoryItem } from '../services/scheduling-api.service';
import { SOURCE_LABEL, STATUS_LABEL, formatDateTime } from './format';

/** Historial inmutable de estados de una cita (HU-025): estado, fuente, actor, fecha/hora y motivo. */
@Component({
  selector: 'app-history-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="mt-3 border-l-2 border-primary-fixed pl-4 space-y-2 text-xs" aria-label="Historial de estados">
      @for (item of items(); track $index) {
        <li class="history-item">
          <p class="font-semibold text-on-surface">{{ statusLabel[item.status] || item.status }}</p>
          <p class="text-outline">
            {{ dateTime(item.occurredAt) }} · {{ sourceLabel[item.source] || item.source }}
            @if (item.actorName) { · {{ item.actorName }} }
          </p>
          @if (item.reason) {
            <p class="text-on-surface-variant">Motivo: {{ item.reason }}</p>
          }
        </li>
      } @empty {
        <li class="text-outline">Sin eventos registrados.</li>
      }
    </ol>
  `,
})
export class HistoryListComponent {
  readonly items = input<HistoryItem[]>([]);
  readonly statusLabel = STATUS_LABEL;
  readonly sourceLabel = SOURCE_LABEL;
  readonly dateTime = formatDateTime;
}
