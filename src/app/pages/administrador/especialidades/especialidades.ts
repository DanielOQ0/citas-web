import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SchedulingApiService, Specialty } from '../../../services/scheduling-api.service';
import { apiMessage } from '../../../shared/format';

type SpecialtyForm = Omit<Specialty, 'id'>;

@Component({
  selector: 'app-admin-especialidades',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Administración</p>
        <h1 class="fcv-title">Especialidades</h1>
        <p class="text-sm text-outline mt-1">La duración (30 o 60 min) la define la especialidad: 30 min ocupa una franja y 60 min dos consecutivas.</p>
      </div>

      @if (message()) {
        <p id="specialties-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }
      @if (inUse(); as s) {
        <div class="fcv-alert-error flex flex-wrap items-center gap-3" role="alert">
          <span>"{{ s.name }}" está en uso por citas o profesionales: no se borra físicamente.</span>
          <button type="button" class="fcv-btn-danger" (click)="deactivate(s)">Desactivar</button>
          <button type="button" class="fcv-btn-ghost" (click)="inUse.set(null)">Cerrar</button>
        </div>
      }

      <form class="fcv-card grid gap-3 md:grid-cols-5 items-end" (ngSubmit)="create()" aria-labelledby="new-specialty-title">
        <h2 id="new-specialty-title" class="font-bold md:col-span-5">Nueva especialidad</h2>
        <label class="fcv-label md:col-span-2">Nombre <input class="fcv-input" name="name" [(ngModel)]="form.name" required maxlength="120"></label>
        <label class="fcv-label">Duración
          <select class="fcv-input" name="duration" [(ngModel)]="form.durationMinutes">
            <option [ngValue]="30">30 minutos</option>
            <option [ngValue]="60">60 minutos</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm pb-2"><input type="checkbox" name="approval" [(ngModel)]="form.requiresAdminApproval"> Requiere aprobación ADMIN</label>
        <button id="btn-create-specialty" class="fcv-btn-primary">Crear</button>
      </form>

      <div class="fcv-card p-0 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left bg-surface-container-low">
              <th class="p-3">Nombre</th><th class="p-3">Duración</th><th class="p-3">Tipo</th><th class="p-3">Estado</th><th class="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (s of items(); track s.id) {
              <tr class="border-t border-outline-variant/20 specialty-row" [attr.data-specialty-id]="s.id">
                @if (editingId() === s.id) {
                  <td class="p-2"><input class="fcv-input" name="editName" [(ngModel)]="edit.name" maxlength="120" aria-label="Nombre"></td>
                  <td class="p-2">
                    <select class="fcv-input" name="editDuration" [(ngModel)]="edit.durationMinutes" aria-label="Duración">
                      <option [ngValue]="30">30 min</option>
                      <option [ngValue]="60">60 min</option>
                    </select>
                  </td>
                  <td class="p-2"><label class="flex items-center gap-1"><input type="checkbox" name="editApproval" [(ngModel)]="edit.requiresAdminApproval"> Aprobación</label></td>
                  <td class="p-2"><label class="flex items-center gap-1"><input type="checkbox" name="editActive" [(ngModel)]="edit.active"> Activa</label></td>
                  <td class="p-2 flex gap-2">
                    <button type="button" class="fcv-btn-primary" (click)="save(s)">Guardar</button>
                    <button type="button" class="fcv-btn-ghost" (click)="editingId.set(null)">Cancelar</button>
                  </td>
                } @else {
                  <td class="p-3 font-semibold">{{ s.name }}</td>
                  <td class="p-3">{{ s.durationMinutes }} min</td>
                  <td class="p-3">{{ s.requiresAdminApproval ? 'Especializada' : 'General' }}</td>
                  <td class="p-3"><span class="fcv-chip" [class]="s.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'">{{ s.active ? 'Activa' : 'Inactiva' }}</span></td>
                  <td class="p-3 flex flex-wrap gap-2">
                    <button type="button" class="fcv-btn-ghost" (click)="startEdit(s)">Editar</button>
                    <button type="button" class="fcv-btn-danger-ghost" (click)="remove(s)">Eliminar</button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td colspan="5" class="p-6 text-center text-outline">Sin especialidades.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class EspecialidadesPage {
  private readonly api = inject(SchedulingApiService);
  readonly items = signal<Specialty[]>([]);
  readonly editingId = signal<number | null>(null);
  readonly inUse = signal<Specialty | null>(null);
  readonly message = signal('');
  readonly error = signal(false);
  form: SpecialtyForm = { name: '', durationMinutes: 30, requiresAdminApproval: true, active: true };
  edit: SpecialtyForm = { ...this.form };

  constructor() {
    this.load();
  }

  load(): void {
    this.api.adminSpecialties().subscribe({
      next: (x) => this.items.set(x),
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar las especialidades.'), true),
    });
  }

  create(): void {
    if (!this.form.name.trim()) return this.show('Ingresa el nombre de la especialidad.', true);
    this.api.createSpecialty({ ...this.form, name: this.form.name.trim() }).subscribe({
      next: (s) => {
        this.show(`Especialidad "${s.name}" creada (${s.durationMinutes} min).`);
        this.form = { name: '', durationMinutes: 30, requiresAdminApproval: true, active: true };
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible crear la especialidad.'), true),
    });
  }

  startEdit(s: Specialty): void {
    this.edit = { name: s.name, durationMinutes: s.durationMinutes, requiresAdminApproval: s.requiresAdminApproval, active: s.active };
    this.editingId.set(s.id);
  }

  save(s: Specialty): void {
    this.api.updateSpecialty(s.id, { ...this.edit, name: this.edit.name.trim() }).subscribe({
      next: (updated) => {
        this.editingId.set(null);
        this.show(`Especialidad "${updated.name}" actualizada.`);
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible actualizar la especialidad.'), true),
    });
  }

  remove(s: Specialty): void {
    this.inUse.set(null);
    this.api.deleteSpecialty(s.id).subscribe({
      next: () => {
        this.show(`Especialidad "${s.name}" eliminada.`);
        this.load();
      },
      error: (e) => {
        if (e.status === 409) {
          this.message.set('');
          this.inUse.set(s);
        } else {
          this.show(apiMessage(e, 'No fue posible eliminar la especialidad.'), true);
        }
      },
    });
  }

  deactivate(s: Specialty): void {
    this.inUse.set(null);
    this.api.updateSpecialty(s.id, { name: s.name, durationMinutes: s.durationMinutes, requiresAdminApproval: s.requiresAdminApproval, active: false }).subscribe({
      next: () => {
        this.show(`Especialidad "${s.name}" desactivada: deja de ofrecerse para nuevas citas.`);
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible desactivar la especialidad.'), true),
    });
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
