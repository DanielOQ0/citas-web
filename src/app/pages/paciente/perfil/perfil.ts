import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Affiliation, PlanItem, Profile, SchedulingApiService } from '../../../services/scheduling-api.service';
import { apiMessage, fieldErrors } from '../../../shared/format';

@Component({
  selector: 'app-perfil',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="space-y-6 max-w-3xl">
      <div>
        <p class="fcv-eyebrow">Portal Paciente</p>
        <h1 class="fcv-title">Mi perfil y afiliación</h1>
      </div>

      @if (message()) {
        <p id="profile-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }

      <form class="fcv-card space-y-4" (ngSubmit)="savePhone()" aria-labelledby="contact-title">
        <h2 id="contact-title" class="font-bold">Datos personales</h2>
        @if (profile(); as p) {
          <dl class="grid gap-3 sm:grid-cols-2 text-sm">
            <div><dt class="fcv-label">Nombre</dt><dd id="profile-name">{{ p.name }}</dd></div>
            <div><dt class="fcv-label">Correo</dt><dd id="profile-email">{{ p.email }}</dd></div>
            <div><dt class="fcv-label">Documento</dt><dd>{{ p.documentType }} {{ p.documentNumber }}</dd></div>
          </dl>
        }
        <p class="text-xs text-outline">Nombre, correo y documento identifican tu cuenta y no se modifican desde aquí.</p>
        <label class="fcv-label max-w-xs">Teléfono de contacto
          <input class="fcv-input" name="phone" inputmode="numeric" [(ngModel)]="phone" required pattern="\\d{7,15}" [class.fcv-input-invalid]="phoneError()">
          @if (phoneError()) { <span class="fcv-field-error">{{ phoneError() }}</span> }
        </label>
        <button id="btn-save-phone" class="fcv-btn-primary">Guardar teléfono</button>
      </form>

      <form class="fcv-card space-y-4" (ngSubmit)="saveAffiliation()" aria-labelledby="affiliation-title">
        <h2 id="affiliation-title" class="font-bold">Afiliación</h2>
        <p id="current-affiliation" class="text-sm">
          @if (affiliation(); as a) {
            Vigente: <strong>{{ a.epsName }}</strong> · {{ a.planName }} · régimen {{ a.regimeName }}
            @if (!a.active) { <span class="fcv-chip bg-error-container text-on-error-container ml-1">Plan inactivo</span> }
          } @else {
            Sin afiliación registrada.
          }
        </p>
        <div class="grid gap-3 sm:grid-cols-3">
          <label class="fcv-label">EPS
            <select class="fcv-input" name="eps" [ngModel]="epsId()" (ngModelChange)="selectEps($event)">
              <option [ngValue]="undefined">Seleccione</option>
              @for (eps of epsOptions(); track eps.id) { <option [ngValue]="eps.id">{{ eps.name }}</option> }
            </select>
          </label>
          <label class="fcv-label">Plan
            <select class="fcv-input" name="plan" [(ngModel)]="planId" [disabled]="!epsId()">
              <option [ngValue]="undefined">Seleccione</option>
              @for (plan of plansOfEps(); track plan.id) { <option [ngValue]="plan.id">{{ plan.name }}</option> }
            </select>
          </label>
          <div>
            <span class="fcv-label">Régimen</span>
            <p class="mt-3 text-sm" id="selected-regime">{{ selectedPlan()?.regimeName || '—' }}</p>
          </div>
        </div>
        <button id="btn-save-affiliation" class="fcv-btn-primary" [disabled]="!epsId() || !planId">Guardar afiliación</button>
      </form>
    </section>
  `,
})
export class PerfilPage {
  private readonly api = inject(SchedulingApiService);
  readonly profile = signal<Profile | null>(null);
  readonly affiliation = signal<Affiliation | null>(null);
  readonly plans = signal<PlanItem[]>([]);
  readonly epsId = signal<number | undefined>(undefined);
  readonly message = signal('');
  readonly error = signal(false);
  readonly phoneError = signal('');
  readonly epsOptions = computed(() => {
    const unique = new Map<number, { id: number; name: string }>();
    for (const plan of this.plans()) unique.set(plan.epsId, { id: plan.epsId, name: plan.epsName });
    return [...unique.values()];
  });
  readonly plansOfEps = computed(() => this.plans().filter((plan) => plan.epsId === this.epsId()));
  phone = '';
  planId: number | undefined;

  constructor() {
    this.api.profile().subscribe({ next: (p) => { this.profile.set(p); this.phone = p.phone; } });
    this.api.affiliation().subscribe({ next: (a) => this.affiliation.set(a) });
    this.api.plans().subscribe({ next: (plans) => this.plans.set(plans) });
  }

  selectedPlan(): PlanItem | undefined {
    return this.plans().find((plan) => plan.id === this.planId);
  }

  selectEps(id: number | undefined): void {
    this.epsId.set(id);
    this.planId = undefined;
  }

  savePhone(): void {
    this.phoneError.set('');
    if (!/^\d{7,15}$/.test(this.phone)) {
      this.phoneError.set('Solo dígitos, entre 7 y 15.');
      return;
    }
    this.api.updatePhone(this.phone).subscribe({
      next: (p) => {
        this.profile.set(p);
        this.show('Teléfono actualizado.');
      },
      error: (e) => {
        this.phoneError.set(fieldErrors(e)['phone'] ?? '');
        this.show(apiMessage(e, 'No fue posible actualizar el teléfono.'), true);
      },
    });
  }

  saveAffiliation(): void {
    const eps = this.epsId();
    if (!eps || !this.planId) return;
    this.api.saveAffiliation(eps, this.planId).subscribe({
      next: (a) => {
        this.affiliation.set(a);
        this.show('Afiliación actualizada.');
      },
      error: (e) => this.show(apiMessage(e, 'No fue posible guardar la afiliación.'), true),
    });
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
