import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment, Block, CatalogItem, HistoryItem, SchedulingApiService } from '../../../services/scheduling-api.service';
import { HistoryListComponent } from '../../../shared/history-list';
import { apiMessage, formatDate, hhmm, todayIso } from '../../../shared/format';

type AgendaMode = 'day' | 'week';

@Component({
  selector: 'app-mi-agenda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, HistoryListComponent],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Portal Médico</p>
        <h1 class="fcv-title">Mi agenda asistencial</h1>
      </div>

      @if (message()) {
        <p id="agenda-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <form class="fcv-card grid gap-4 md:grid-cols-5 items-end" (ngSubmit)="saveBlock()" aria-labelledby="block-form-title">
        <h2 id="block-form-title" class="font-bold md:col-span-5">{{ editingId ? 'Editar bloque de disponibilidad' : 'Publicar bloque de disponibilidad' }}</h2>
        <label class="fcv-label">Sede
          <select class="fcv-input" name="location" [(ngModel)]="form.locationId">
            <option [ngValue]="0">Seleccione</option>
            @for (location of locations(); track location.id) { <option [ngValue]="location.id">{{ location.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Fecha <input class="fcv-input" type="date" name="date" [min]="today" [(ngModel)]="form.date"></label>
        <label class="fcv-label">Inicio <input class="fcv-input" type="time" step="1800" name="start" [(ngModel)]="form.startTime"></label>
        <label class="fcv-label">Fin <input class="fcv-input" type="time" step="1800" name="end" [(ngModel)]="form.endTime"></label>
        <div class="flex gap-2">
          <button id="btn-save-block" class="fcv-btn-primary">{{ editingId ? 'Guardar cambios' : 'Publicar bloque' }}</button>
          @if (editingId) { <button type="button" class="fcv-btn-ghost" (click)="cancelEdit()">Cancelar</button> }
        </div>
        <p class="text-xs text-outline md:col-span-5">Los bloques se dividen en franjas de 30 minutos, no pueden estar en el pasado ni solaparse, y solo se publican en sedes asignadas.</p>
      </form>

      <section class="fcv-card space-y-3" aria-labelledby="blocks-title">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 id="blocks-title" class="font-bold">Calendario de bloques</h2>
          <form class="flex flex-wrap items-end gap-2" (ngSubmit)="loadBlocks()">
            <label class="fcv-label">Fecha <input class="fcv-input" type="date" name="blockDate" [(ngModel)]="blockDate"></label>
            <label class="fcv-label">Sede
              <select class="fcv-input" name="blockLocation" [(ngModel)]="blockLocationId">
                <option [ngValue]="undefined">Todas</option>
                @for (location of locations(); track location.id) { <option [ngValue]="location.id">{{ location.name }}</option> }
              </select>
            </label>
            <button id="btn-filter-blocks" class="fcv-btn-secondary">Filtrar</button>
          </form>
        </div>
        <ul class="divide-y divide-outline-variant/30">
          @for (block of blocks(); track block.id) {
            <li class="py-3 flex flex-wrap items-center justify-between gap-3 text-sm block-row">
              <span>
                <strong>{{ date(block.date) }}</strong> · {{ time(block.startTime) }}–{{ time(block.endTime) }} · {{ block.locationName }}
                <span class="text-outline">· {{ block.slots }} franjas · {{ block.committedSlots }} reservadas/retenidas</span>
              </span>
              <span class="flex gap-2">
                <button type="button" class="fcv-btn-ghost" [disabled]="block.committedSlots > 0" [title]="block.committedSlots > 0 ? 'Tiene citas reservadas o retenidas' : ''" (click)="edit(block)">Editar</button>
                <button type="button" class="fcv-btn-danger-ghost" [disabled]="block.committedSlots > 0" [title]="block.committedSlots > 0 ? 'Tiene citas reservadas o retenidas' : ''" (click)="remove(block)">Eliminar</button>
              </span>
            </li>
          } @empty {
            <li class="fcv-empty">No hay bloques para el filtro seleccionado.</li>
          }
        </ul>
      </section>

      <section class="fcv-card space-y-3" aria-labelledby="appointments-title">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <h2 id="appointments-title" class="font-bold">Citas aprobadas</h2>
          <form class="flex flex-wrap items-end gap-2" (ngSubmit)="loadAgenda()">
            <label class="fcv-label">Vista
              <select class="fcv-input" name="mode" [(ngModel)]="mode">
                <option value="day">Día</option>
                <option value="week">Semana</option>
              </select>
            </label>
            <label class="fcv-label">Fecha <input class="fcv-input" type="date" name="agendaDate" [(ngModel)]="agendaDate"></label>
            <label class="fcv-label">Sede
              <select class="fcv-input" name="agendaLocation" [(ngModel)]="agendaLocationId">
                <option [ngValue]="undefined">Todas</option>
                @for (location of locations(); track location.id) { <option [ngValue]="location.id">{{ location.name }}</option> }
              </select>
            </label>
            <button id="btn-filter-agenda" class="fcv-btn-secondary">Ver agenda</button>
          </form>
        </div>
        <p class="text-xs text-outline">{{ range() }}</p>
        <ul class="divide-y divide-outline-variant/30">
          @for (a of agenda(); track a.id) {
            <li class="py-3 text-sm agenda-row">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span>
                  <strong>{{ date(a.date) }} · {{ time(a.startTime) }}–{{ time(a.endTime) }}</strong> · {{ a.durationMinutes }} min ·
                  {{ a.patientName }} · {{ a.specialtyName }} · {{ a.locationName }}
                </span>
                <span class="flex flex-wrap gap-2">
                  <button type="button" class="fcv-btn-ghost" (click)="toggleHistory(a.id)">{{ historyFor() === a.id ? 'Ocultar' : 'Historial' }}</button>
                  @if (ended(a)) {
                    <button type="button" class="fcv-btn-primary" (click)="close(a, 'COMPLETED')">Completada</button>
                    <button type="button" class="fcv-btn-danger-ghost" (click)="close(a, 'NO_SHOW')">No asistió</button>
                  }
                </span>
              </div>
              @if (historyFor() === a.id) { <app-history-list [items]="history()" /> }
            </li>
          } @empty {
            <li class="fcv-empty">No hay citas aprobadas en el periodo seleccionado.</li>
          }
        </ul>
      </section>
    </section>
  `,
})
export class MiAgendaPage {
  private readonly api = inject(SchedulingApiService);
  readonly date = formatDate;
  readonly time = hhmm;
  readonly today = todayIso();
  readonly locations = signal<CatalogItem[]>([]);
  readonly blocks = signal<Block[]>([]);
  readonly agenda = signal<Appointment[]>([]);
  readonly history = signal<HistoryItem[]>([]);
  readonly historyFor = signal<number | null>(null);
  readonly range = signal('');
  readonly message = signal('');
  readonly error = signal(false);
  form = { locationId: 0, date: todayIso(1), startTime: '08:00', endTime: '12:00' };
  editingId?: number;
  blockDate = '';
  blockLocationId: number | undefined;
  mode: AgendaMode = 'week';
  agendaDate = todayIso();
  agendaLocationId: number | undefined;

  constructor() {
    this.api.locations().subscribe({ next: (x) => this.locations.set(x) });
    this.loadBlocks();
    this.loadAgenda();
  }

  loadBlocks(): void {
    this.api.blocks(this.blockDate || undefined, this.blockLocationId).subscribe({
      next: (x) => this.blocks.set(x),
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar los bloques.'), true),
    });
  }

  /** HU-023: día o semana (lunes a domingo) de la fecha elegida, filtrable por sede. */
  loadAgenda(): void {
    const [from, to] = this.mode === 'day' ? [this.agendaDate, this.agendaDate] : weekOf(this.agendaDate);
    this.range.set(from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`);
    this.api.agenda(from, to, this.agendaLocationId).subscribe({
      next: (x) => this.agenda.set(x),
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar la agenda.'), true),
    });
  }

  saveBlock(): void {
    if (!this.form.locationId) return this.show('Selecciona una sede.', true);
    const request = this.editingId ? this.api.updateBlock(this.editingId, this.form) : this.api.createBlock(this.form);
    request.subscribe({
      next: () => {
        this.show(this.editingId ? 'Bloque actualizado.' : 'Bloque publicado en franjas de 30 minutos.');
        this.cancelEdit();
        this.loadBlocks();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible guardar el bloque.'), true),
    });
  }

  edit(block: Block): void {
    this.editingId = block.id;
    this.form = { locationId: block.locationId, date: block.date, startTime: hhmm(block.startTime), endTime: hhmm(block.endTime) };
  }

  cancelEdit(): void {
    this.editingId = undefined;
  }

  remove(block: Block): void {
    this.api.deleteBlock(block.id).subscribe({
      next: () => {
        this.show('Bloque eliminado.');
        this.loadBlocks();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible eliminar el bloque.'), true),
    });
  }

  /** HU-024: aplicable cuando la hora de fin ya pasó. */
  ended(a: Appointment): boolean {
    return new Date(`${a.date}T${hhmm(a.endTime)}`) < new Date();
  }

  close(a: Appointment, outcome: 'COMPLETED' | 'NO_SHOW'): void {
    this.api.close(a.id, outcome).subscribe({
      next: () => {
        this.show(outcome === 'COMPLETED' ? 'Atención registrada como completada.' : 'Inasistencia registrada.');
        this.loadAgenda();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible cerrar la atención.'), true),
    });
  }

  toggleHistory(id: number): void {
    if (this.historyFor() === id) {
      this.historyFor.set(null);
      return;
    }
    this.api.history(id).subscribe({
      next: (items) => {
        this.history.set(items);
        this.historyFor.set(id);
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar el historial.'), true),
    });
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}

function weekOf(isoDate: string): [string, string] {
  const day = new Date(`${isoDate}T00:00:00Z`);
  const monday = new Date(day);
  monday.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return [monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10)];
}
