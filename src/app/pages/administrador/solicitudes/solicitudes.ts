import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, SchedulingApiService } from '../../../services/scheduling-api.service';

@Component({ selector: 'app-admin-solicitudes', changeDetection: ChangeDetectionStrategy.OnPush, imports: [FormsModule], template: `
  <section class="space-y-6"><div class="flex justify-between"><div><p class="text-xs text-outline">Administración</p><h1 class="text-2xl font-bold">Solicitudes especializadas</h1></div><button class="px-4 py-2 rounded-xl bg-primary text-on-primary" (click)="load()">Actualizar</button></div>
  @if (message()) {<p class="text-sm" [class.text-error]="error()">{{message()}}</p>}
  <div class="rounded-3xl bg-surface-container-lowest border border-outline-variant/40 overflow-hidden"><table class="w-full text-sm"><thead><tr class="text-left bg-surface-container-low"><th class="p-3">ID</th><th>Profesional</th><th>Fecha</th><th>Duración</th><th class="p-3">Acción</th></tr></thead><tbody>@for (a of items(); track a.id) {<tr class="border-t border-outline-variant/20"><td class="p-3">#{{a.id}}</td><td>#{{a.professionalId}}</td><td>{{a.date}} {{a.startTime}}</td><td>{{a.durationMinutes}} min</td><td class="p-3 flex gap-2"><button class="px-3 py-1 rounded-lg bg-primary text-on-primary" (click)="decide(a,'APPROVE')">Aprobar</button><button class="px-3 py-1 rounded-lg bg-error text-on-error" (click)="decide(a,'REJECT')">Rechazar</button></td></tr>} @empty {<tr><td colspan="5" class="p-6 text-center text-outline">No hay solicitudes pendientes.</td></tr>}</tbody></table></div></section>` })
export class AdminSolicitudesPage {
  private readonly api = inject(SchedulingApiService); private readonly platform=inject(PLATFORM_ID); readonly items = signal<Appointment[]>([]); readonly message = signal(''); readonly error = signal(false);
  constructor(){if(isPlatformBrowser(this.platform))this.load();}
  load(){this.api.requested().subscribe({next:x=>{this.items.set(x);this.message.set('');},error:e=>this.show(e.status===403?'Solo ADMIN puede consultar solicitudes.':'No fue posible cargar solicitudes.',true)});}
  decide(a:Appointment, decision:'APPROVE'|'REJECT'){const reason=decision==='REJECT'?prompt('Motivo de rechazo (obligatorio):')||'':'';if(decision==='REJECT'&&!reason.trim()){this.show('El motivo es obligatorio.',true);return;}this.api.decide(a.id,decision,reason).subscribe({next:()=>{this.show(decision==='APPROVE'?'Solicitud aprobada.':'Solicitud rechazada.');this.load();},error:e=>this.show(e.status===400?'Revise el motivo.':'No fue posible decidir la solicitud.',true)});}
  private show(text:string,error=false){this.message.set(text);this.error.set(error);}
}
