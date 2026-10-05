import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogItem, EpsItem, PlanItem, PlanRequest, SchedulingApiService } from '../../../services/scheduling-api.service';
import { apiMessage } from '../../../shared/format';

type InUse = { kind: 'eps'; item: EpsItem } | { kind: 'plan'; item: PlanItem };

@Component({
  selector: 'app-admin-eps-planes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <section class="space-y-6">
      <div>
        <p class="fcv-eyebrow">Administración</p>
        <h1 class="fcv-title">EPS y planes</h1>
        <p class="text-sm text-outline mt-1">Una EPS o plan inactivo no admite nuevas afiliaciones; lo que está en uso se desactiva en lugar de eliminarse.</p>
      </div>

      @if (message()) {
        <p id="eps-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
      }
      @if (inUse(); as used) {
        <div class="fcv-alert-error flex flex-wrap items-center gap-3" role="alert">
          <span>"{{ used.item.name }}" {{ used.kind === 'eps' ? 'tiene planes asociados' : 'tiene afiliaciones' }}: no se borra físicamente.</span>
          <button type="button" class="fcv-btn-danger" (click)="deactivate(used)">Desactivar</button>
          <button type="button" class="fcv-btn-ghost" (click)="inUse.set(null)">Cerrar</button>
        </div>
      }

      <div class="grid gap-6 lg:grid-cols-2">
        <section class="fcv-card space-y-4" aria-labelledby="eps-title">
          <h2 id="eps-title" class="font-bold">EPS</h2>
          <form class="grid gap-2 sm:grid-cols-4 items-end" (ngSubmit)="createEps()">
            <label class="fcv-label">Código <input class="fcv-input" name="epsCode" [(ngModel)]="eps.code" required maxlength="30"></label>
            <label class="fcv-label sm:col-span-2">Nombre <input class="fcv-input" name="epsName" [(ngModel)]="eps.name" required maxlength="150"></label>
            <button id="btn-create-eps" class="fcv-btn-primary">Crear EPS</button>
          </form>
          <ul class="divide-y divide-outline-variant/30 text-sm">
            @for (e of epsList(); track e.id) {
              <li class="py-2 flex flex-wrap items-center justify-between gap-2 eps-row" [attr.data-eps-id]="e.id">
                @if (editingEps() === e.id) {
                  <span class="flex flex-wrap gap-2 items-center">
                    <input class="fcv-input w-28" name="editEpsCode" [(ngModel)]="epsEdit.code" aria-label="Código">
                    <input class="fcv-input w-48" name="editEpsName" [(ngModel)]="epsEdit.name" aria-label="Nombre">
                    <label class="flex items-center gap-1"><input type="checkbox" name="editEpsActive" [(ngModel)]="epsEdit.active"> Activa</label>
                  </span>
                  <span class="flex gap-2">
                    <button type="button" class="fcv-btn-primary" (click)="saveEps(e)">Guardar</button>
                    <button type="button" class="fcv-btn-ghost" (click)="editingEps.set(null)">Cancelar</button>
                  </span>
                } @else {
                  <span><strong>{{ e.name }}</strong> · {{ e.code }}
                    <span class="fcv-chip ml-1" [class]="e.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'">{{ e.active ? 'Activa' : 'Inactiva' }}</span>
                  </span>
                  <span class="flex gap-2">
                    <button type="button" class="fcv-btn-ghost" (click)="startEditEps(e)">Editar</button>
                    <button type="button" class="fcv-btn-danger-ghost" (click)="removeEps(e)">Eliminar</button>
                  </span>
                }
              </li>
            } @empty {
              <li class="fcv-empty">Sin EPS registradas.</li>
            }
          </ul>
        </section>

        <section class="fcv-card space-y-4" aria-labelledby="plans-title">
          <h2 id="plans-title" class="font-bold">Planes</h2>
          <form class="grid gap-2 sm:grid-cols-2 items-end" (ngSubmit)="createPlan()">
            <label class="fcv-label">EPS
              <select class="fcv-input" name="planEps" [(ngModel)]="plan.epsId">
                <option [ngValue]="0">Seleccione</option>
                @for (e of epsList(); track e.id) { <option [ngValue]="e.id">{{ e.name }}</option> }
              </select>
            </label>
            <label class="fcv-label">Régimen
              <select class="fcv-input" name="planRegime" [(ngModel)]="plan.regimeId">
                <option [ngValue]="0">Seleccione</option>
                @for (r of regimes(); track r.id) { <option [ngValue]="r.id">{{ r.name }}</option> }
              </select>
            </label>
            <label class="fcv-label">Código <input class="fcv-input" name="planCode" [(ngModel)]="plan.code" required maxlength="50"></label>
            <label class="fcv-label">Nombre <input class="fcv-input" name="planName" [(ngModel)]="plan.name" required maxlength="150"></label>
            <button id="btn-create-plan" class="fcv-btn-primary sm:col-span-2">Crear plan</button>
          </form>
          <ul class="divide-y divide-outline-variant/30 text-sm">
            @for (p of plans(); track p.id) {
              <li class="py-2 flex flex-wrap items-center justify-between gap-2 plan-row" [attr.data-plan-id]="p.id">
                @if (editingPlan() === p.id) {
                  <span class="flex flex-wrap gap-2 items-center">
                    <input class="fcv-input w-28" name="editPlanCode" [(ngModel)]="planEdit.code" aria-label="Código">
                    <input class="fcv-input w-48" name="editPlanName" [(ngModel)]="planEdit.name" aria-label="Nombre">
                    <select class="fcv-input w-36" name="editPlanRegime" [(ngModel)]="planEdit.regimeId" aria-label="Régimen">
                      @for (r of regimes(); track r.id) { <option [ngValue]="r.id">{{ r.name }}</option> }
                    </select>
                    <label class="flex items-center gap-1"><input type="checkbox" name="editPlanActive" [(ngModel)]="planEdit.active"> Activo</label>
                  </span>
                  <span class="flex gap-2">
                    <button type="button" class="fcv-btn-primary" (click)="savePlan(p)">Guardar</button>
                    <button type="button" class="fcv-btn-ghost" (click)="editingPlan.set(null)">Cancelar</button>
                  </span>
                } @else {
                  <span><strong>{{ p.name }}</strong> · {{ p.epsName }} · {{ p.regimeName }} · {{ p.code }}
                    <span class="fcv-chip ml-1" [class]="p.active ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-container-high text-on-surface-variant'">{{ p.active ? 'Activo' : 'Inactivo' }}</span>
                  </span>
                  <span class="flex gap-2">
                    <button type="button" class="fcv-btn-ghost" (click)="startEditPlan(p)">Editar</button>
                    <button type="button" class="fcv-btn-danger-ghost" (click)="removePlan(p)">Eliminar</button>
                  </span>
                }
              </li>
            } @empty {
              <li class="fcv-empty">Sin planes registrados.</li>
            }
          </ul>
        </section>
      </div>
    </section>
  `,
})
export class EpsPlanesPage {
  private readonly api = inject(SchedulingApiService);
  readonly epsList = signal<EpsItem[]>([]);
  readonly plans = signal<PlanItem[]>([]);
  readonly regimes = signal<CatalogItem[]>([]);
  readonly editingEps = signal<number | null>(null);
  readonly editingPlan = signal<number | null>(null);
  readonly inUse = signal<InUse | null>(null);
  readonly message = signal('');
  readonly error = signal(false);
  eps = { code: '', name: '', active: true };
  epsEdit = { code: '', name: '', active: true };
  plan: PlanRequest = { epsId: 0, regimeId: 0, code: '', name: '', active: true };
  planEdit: PlanRequest = { ...this.plan };

  constructor() {
    this.api.regimes().subscribe({ next: (x) => this.regimes.set(x) });
    this.load();
  }

  load(): void {
    this.api.adminEps().subscribe({ next: (x) => this.epsList.set(x), error: (e) => this.show(apiMessage(e, 'No fue posible cargar las EPS.'), true) });
    this.api.adminPlans().subscribe({ next: (x) => this.plans.set(x), error: (e) => this.show(apiMessage(e, 'No fue posible cargar los planes.'), true) });
  }

  createEps(): void {
    if (!this.eps.code.trim() || !this.eps.name.trim()) return this.show('Código y nombre son obligatorios.', true);
    this.api.createEps(this.eps).subscribe({
      next: (e) => { this.show(`EPS "${e.name}" creada.`); this.eps = { code: '', name: '', active: true }; this.load(); },
      error: (e) => this.show(apiMessage(e, 'No fue posible crear la EPS.'), true),
    });
  }

  startEditEps(e: EpsItem): void {
    this.epsEdit = { code: e.code, name: e.name, active: e.active };
    this.editingEps.set(e.id);
  }

  saveEps(e: EpsItem): void {
    this.api.updateEps(e.id, this.epsEdit).subscribe({
      next: (u) => { this.editingEps.set(null); this.show(`EPS "${u.name}" actualizada.`); this.load(); },
      error: (err) => this.show(apiMessage(err, 'No fue posible actualizar la EPS.'), true),
    });
  }

  removeEps(e: EpsItem): void {
    this.inUse.set(null);
    this.api.deleteEps(e.id).subscribe({
      next: () => { this.show(`EPS "${e.name}" eliminada.`); this.load(); },
      error: (err) => (err.status === 409 ? this.flagInUse({ kind: 'eps', item: e }) : this.show(apiMessage(err, 'No fue posible eliminar la EPS.'), true)),
    });
  }

  createPlan(): void {
    if (!this.plan.epsId || !this.plan.regimeId || !this.plan.code.trim() || !this.plan.name.trim()) {
      return this.show('EPS, régimen, código y nombre son obligatorios.', true);
    }
    this.api.createPlan(this.plan).subscribe({
      next: (p) => { this.show(`Plan "${p.name}" creado para ${p.epsName}.`); this.plan = { epsId: 0, regimeId: 0, code: '', name: '', active: true }; this.load(); },
      error: (e) => this.show(apiMessage(e, 'No fue posible crear el plan.'), true),
    });
  }

  startEditPlan(p: PlanItem): void {
    this.planEdit = { epsId: p.epsId, regimeId: p.regimeId, code: p.code, name: p.name, active: p.active };
    this.editingPlan.set(p.id);
  }

  savePlan(p: PlanItem): void {
    this.api.updatePlan(p.id, this.planEdit).subscribe({
      next: (u) => { this.editingPlan.set(null); this.show(`Plan "${u.name}" actualizado.`); this.load(); },
      error: (e) => this.show(apiMessage(e, 'No fue posible actualizar el plan.'), true),
    });
  }

  removePlan(p: PlanItem): void {
    this.inUse.set(null);
    this.api.deletePlan(p.id).subscribe({
      next: () => { this.show(`Plan "${p.name}" eliminado.`); this.load(); },
      error: (e) => (e.status === 409 ? this.flagInUse({ kind: 'plan', item: p }) : this.show(apiMessage(e, 'No fue posible eliminar el plan.'), true)),
    });
  }

  deactivate(used: InUse): void {
    this.inUse.set(null);
    const request = used.kind === 'eps'
      ? this.api.updateEps(used.item.id, { code: used.item.code, name: used.item.name, active: false })
      : this.api.updatePlan(used.item.id, { epsId: used.item.epsId, regimeId: used.item.regimeId, code: used.item.code, name: used.item.name, active: false });
    request.subscribe({
      next: () => { this.show(`"${used.item.name}" desactivado: no admite nuevas afiliaciones.`); this.load(); },
      error: (e) => this.show(apiMessage(e, 'No fue posible desactivar.'), true),
    });
  }

  private flagInUse(used: InUse): void {
    this.message.set('');
    this.inUse.set(used);
  }

  private show(text: string, isError = false): void {
    this.message.set(text);
    this.error.set(isError);
  }
}
