import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CatalogItem, ProfessionalAdmin, SchedulingApiService, Specialty } from '../../../services/scheduling-api.service';
import { DOCUMENT_TYPES, apiMessage, fieldErrors } from '../../../shared/format';

interface Draft { specialtyIds: number[]; primarySpecialtyId: number | null; locationIds: number[]; }

@Component({
  selector: 'app-admin-profesionales',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Administración</p>
        <h1 class="fcv-title">Profesionales</h1>
        <p class="text-sm text-outline mt-1">Alta de profesionales sintéticos, especialidades (con una primaria), sedes y habilitación.</p>
      </div>

      @if (message()) {
        <p id="professionals-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <form #createForm="ngForm" class="fcv-card grid gap-3 md:grid-cols-3" (ngSubmit)="create(createForm)" novalidate aria-labelledby="create-title">
        <h2 id="create-title" class="font-bold md:col-span-3">Registrar profesional</h2>
        <label class="fcv-label">Nombres <input class="fcv-input" name="firstName" [(ngModel)]="form.firstName" required maxlength="80"></label>
        <label class="fcv-label">Apellidos <input class="fcv-input" name="lastName" [(ngModel)]="form.lastName" required maxlength="80"></label>
        <label class="fcv-label">Correo
          <input class="fcv-input" name="email" type="email" [(ngModel)]="form.email" required email [class.fcv-input-invalid]="server()['email']">
          @if (server()['email']) { <span class="fcv-field-error">{{ server()['email'] }}</span> }
        </label>
        <label class="fcv-label">Tipo de documento
          <select class="fcv-input" name="documentType" [(ngModel)]="form.documentType">
            @for (type of documentTypes; track type.code) { <option [value]="type.code">{{ type.code }} · {{ type.name }}</option> }
          </select>
        </label>
        <label class="fcv-label">Número de documento
          <input class="fcv-input" name="documentNumber" [(ngModel)]="form.documentNumber" required pattern="[A-Za-z0-9]{5,20}" [class.fcv-input-invalid]="server()['documentNumber']">
          @if (server()['documentNumber']) { <span class="fcv-field-error">{{ server()['documentNumber'] }}</span> }
        </label>
        <label class="fcv-label">Teléfono
          <input class="fcv-input" name="phone" inputmode="numeric" [(ngModel)]="form.phone" required pattern="\\d{7,15}" [class.fcv-input-invalid]="server()['phone']">
          @if (server()['phone']) { <span class="fcv-field-error">{{ server()['phone'] }}</span> }
        </label>
        <label class="fcv-label">Código profesional (ficticio) <input class="fcv-input" name="professionalCode" [(ngModel)]="form.professionalCode" required maxlength="40"></label>
        <label class="fcv-label">Matrícula (ficticia) <input class="fcv-input" name="licenseNumber" [(ngModel)]="form.licenseNumber" required maxlength="80"></label>
        <label class="fcv-label">Contraseña inicial
          <input class="fcv-input" name="password" type="password" autocomplete="new-password" [(ngModel)]="form.password" required minlength="8" [class.fcv-input-invalid]="server()['password']">
          @if (server()['password']) { <span class="fcv-field-error">{{ server()['password'] }}</span> }
        </label>
        <div class="md:col-span-3"><button id="btn-create-professional" class="fcv-btn-primary">Registrar profesional</button></div>
      </form>

      <section class="space-y-3" aria-labelledby="list-title">
        <h2 id="list-title" class="font-bold">Profesionales registrados</h2>
        @for (p of professionals(); track p.id) {
          <article class="fcv-card space-y-3 professional-row" [attr.data-professional-id]="p.id">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-bold">{{ p.name }} <span class="fcv-chip ml-1" [class]="p.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'">{{ p.active ? 'Activo' : 'Inactivo' }}</span></p>
                <p class="text-xs text-outline">{{ p.professionalCode }} · Matrícula {{ p.licenseNumber }} · {{ p.email }}</p>
              </div>
              <button type="button" [class]="p.active ? 'fcv-btn-danger-ghost' : 'fcv-btn-primary'" (click)="toggle(p)">{{ p.active ? 'Desactivar' : 'Activar' }}</button>
            </div>
            <div class="grid gap-3 md:grid-cols-2 text-sm">
              <fieldset class="space-y-1">
                <legend class="fcv-label mb-1">Especialidades (● primaria)</legend>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  @for (s of specialties(); track s.id) {
                    <span class="inline-flex items-center gap-1">
                      <input type="checkbox" [id]="'sp-' + p.id + '-' + s.id" [checked]="draft(p).specialtyIds.includes(s.id)" (change)="toggleSpecialty(p, s.id)">
                      <label [for]="'sp-' + p.id + '-' + s.id">{{ s.name }}</label>
                      @if (draft(p).specialtyIds.includes(s.id)) {
                        <input type="radio" [name]="'primary-' + p.id" [checked]="draft(p).primarySpecialtyId === s.id" (change)="setPrimary(p, s.id)" [attr.aria-label]="'Primaria: ' + s.name">
                      }
                    </span>
                  }
                </div>
              </fieldset>
              <fieldset class="space-y-1">
                <legend class="fcv-label mb-1">Sedes</legend>
                @for (l of locations(); track l.id) {
                  <span class="flex items-center gap-1">
                    <input type="checkbox" [id]="'loc-' + p.id + '-' + l.id" [checked]="draft(p).locationIds.includes(l.id)" (change)="toggleLocation(p, l.id)">
                    <label [for]="'loc-' + p.id + '-' + l.id">{{ l.name }}</label>
                  </span>
                }
              </fieldset>
            </div>
            <button type="button" class="fcv-btn-secondary" (click)="saveAssignments(p)">Guardar asignaciones</button>
          </article>
        } @empty {
          <p class="fcv-empty">No hay profesionales registrados.</p>
        }
      </section>
    </section>
  `,
})
export class ProfesionalesPage {
  private readonly api = inject(SchedulingApiService);
  readonly documentTypes = DOCUMENT_TYPES;
  readonly professionals = signal<ProfessionalAdmin[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly locations = signal<CatalogItem[]>([]);
  readonly server = signal<Record<string, string>>({});
  readonly message = signal('');
  readonly error = signal(false);
  private drafts: Record<number, Draft> = {};
  form = this.emptyForm();

  constructor() {
    this.api.adminSpecialties().subscribe({ next: (x) => this.specialties.set(x.filter((s) => s.active)) });
    this.api.locations().subscribe({ next: (x) => this.locations.set(x) });
    this.load();
  }

  load(): void {
    this.api.professionals().subscribe({
      next: (items) => {
        this.drafts = {};
        this.professionals.set(items);
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible cargar los profesionales.'), true),
    });
  }

  draft(p: ProfessionalAdmin): Draft {
    return (this.drafts[p.id] ??= { specialtyIds: [...p.specialtyIds], primarySpecialtyId: p.primarySpecialtyId, locationIds: [...p.locationIds] });
  }

  toggleSpecialty(p: ProfessionalAdmin, id: number): void {
    const d = this.draft(p);
    d.specialtyIds = d.specialtyIds.includes(id) ? d.specialtyIds.filter((x) => x !== id) : [...d.specialtyIds, id];
    if (!d.specialtyIds.includes(d.primarySpecialtyId ?? -1)) d.primarySpecialtyId = d.specialtyIds[0] ?? null;
  }

  setPrimary(p: ProfessionalAdmin, id: number): void {
    this.draft(p).primarySpecialtyId = id;
  }

  toggleLocation(p: ProfessionalAdmin, id: number): void {
    const d = this.draft(p);
    d.locationIds = d.locationIds.includes(id) ? d.locationIds.filter((x) => x !== id) : [...d.locationIds, id];
  }

  saveAssignments(p: ProfessionalAdmin): void {
    const d = this.draft(p);
    if (!d.specialtyIds.length || !d.primarySpecialtyId || !d.locationIds.length) {
      return this.show('Asigna al menos una especialidad (con una primaria) y una sede.', true);
    }
    this.api.setAssignments(p.id, { specialtyIds: d.specialtyIds, primarySpecialtyId: d.primarySpecialtyId, locationIds: d.locationIds }).subscribe({
      next: () => {
        this.show(`Asignaciones de ${p.name} guardadas.`);
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible guardar las asignaciones.'), true),
    });
  }

  toggle(p: ProfessionalAdmin): void {
    this.api.setProfessionalActive(p.id, !p.active).subscribe({
      next: () => {
        this.show(p.active ? `${p.name} quedó inactivo: ya no se ofrece en búsquedas ni publica bloques.` : `${p.name} quedó activo.`);
        this.load();
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible actualizar el profesional.'), true),
    });
  }

  create(form: NgForm): void {
    this.server.set({});
    if (form.invalid) return this.show('Revisa los datos del profesional (documento 5-20 alfanumérico, teléfono 7-15 dígitos, contraseña ≥ 8).', true);
    this.api.createProfessional({ ...this.form, email: this.form.email.trim() }).subscribe({
      next: (created) => {
        this.show(`Profesional ${created.name} registrado (${created.professionalCode}). Asígnale especialidades y sedes.`);
        this.form = this.emptyForm();
        form.resetForm(this.form);
        this.load();
      },
      error: (e) => {
        this.server.set(fieldErrors(e));
        this.show(apiMessage(e, 'No fue posible registrar el profesional.'), true);
      },
    });
  }

  private emptyForm() {
    return { firstName: '', lastName: '', documentType: 'CC', documentNumber: '', email: '', phone: '', password: '', professionalCode: '', licenseNumber: '' };
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
