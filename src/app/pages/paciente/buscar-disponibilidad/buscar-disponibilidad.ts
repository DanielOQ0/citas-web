import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulingApiService, Availability, CatalogItem, Specialty } from '../../../services/scheduling-api.service';

@Component({
  selector: 'app-buscar-disponibilidad', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule],
  template: `
    <section class="space-y-6"><div><p class="text-xs text-outline">Portal Paciente</p><h1 class="font-headline-md text-2xl font-bold">Buscar disponibilidad</h1></div>
    <div class="rounded-3xl bg-surface-container-lowest p-6 border border-outline-variant/40 grid gap-4 md:grid-cols-4">
      <label class="text-xs font-semibold">Sede<select class="mt-1 w-full p-2 rounded-xl" [(ngModel)]="locationId"><option [ngValue]="0">Seleccione</option>@for (l of locations(); track l.id) {<option [ngValue]="l.id">{{l.name}}</option>}</select></label>
      <label class="text-xs font-semibold">Especialidad<select class="mt-1 w-full p-2 rounded-xl" [(ngModel)]="specialtyId"><option [ngValue]="0">Seleccione</option>@for (s of specialties(); track s.id) {<option [ngValue]="s.id">{{s.name}} · {{s.durationMinutes}} min</option>}</select></label>
      <label class="text-xs font-semibold">Fecha<input class="mt-1 w-full p-2 rounded-xl" type="date" [(ngModel)]="date"></label>
      <button class="self-end py-2 rounded-xl bg-primary text-on-primary font-semibold" (click)="search()">Buscar</button>
    </div>
    @if (error()) {<p class="text-error text-sm">{{error()}}</p>}
    <div class="grid gap-4 md:grid-cols-2">@for (slot of slots(); track slot.professionalId + '-' + slot.startTime) {<article class="rounded-3xl bg-surface-container-lowest p-5 border border-outline-variant/40"><p class="font-bold">Profesional #{{slot.professionalId}}</p><p class="text-sm text-outline">{{slot.date}} · {{slot.startTime}} · {{slot.durationMinutes}} min</p><button class="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm" (click)="book(slot)">Confirmar cita</button></article>} @empty {<p class="text-sm text-outline">{{searched() ? 'No hay horarios disponibles para esa combinación. Prueba otra sede o fecha.' : 'Consulta una sede, especialidad y fecha para ver horarios reales.'}}</p>}</div>
    </section>`
})
export class BuscarDisponibilidadPage {
  private readonly api = inject(SchedulingApiService); private readonly platform = inject(PLATFORM_ID);
  readonly locations = signal<CatalogItem[]>([]); readonly specialties = signal<Specialty[]>([]); readonly slots = signal<Availability[]>([]); readonly error = signal(''); readonly searched = signal(false);
  locationId = 0; specialtyId = 0; date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  constructor() { if(isPlatformBrowser(this.platform)){ this.api.locations().subscribe({ next: x => this.locations.set(x), error: () => this.error.set('No fue posible cargar las sedes.') }); this.api.specialties().subscribe({ next: x => this.specialties.set(x.filter(s => s.active)), error: () => this.error.set('No fue posible cargar especialidades.') }); } }
  search() { if (!this.locationId || !this.specialtyId || !this.date) { this.error.set('Seleccione sede, especialidad y fecha.'); return; } this.error.set(''); this.searched.set(true); this.slots.set([]); this.api.availability(this.locationId, this.specialtyId, this.date).subscribe({ next: x => this.slots.set(x), error: e => this.error.set(e.status === 0 ? 'No fue posible conectar con la API.' : 'No fue posible consultar disponibilidad.') }); }
  book(slot: Availability) { this.api.book({ professionalId: slot.professionalId, locationId: slot.locationId, specialtyId: slot.specialtyId, date: slot.date, startTime: slot.startTime }).subscribe({ next: a => { this.error.set(a.status === 'APPROVED' ? 'Cita general aprobada.' : 'Solicitud especializada registrada para revisión.'); this.search(); }, error: e => this.error.set(e.status === 409 ? 'El horario acaba de ser tomado; actualiza la búsqueda.' : 'No fue posible reservar la cita.') }); }
}
