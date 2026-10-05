import { Injectable, inject, signal } from '@angular/core';
import { Appointment, SchedulingApiService } from './scheduling-api.service';
import { SessionService } from './session.service';

/** Contadores del menú lateral, siempre calculados con datos reales de la API según el rol de la sesión. */
@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly api = inject(SchedulingApiService);
  private readonly session = inject(SessionService);

  readonly upcomingAppointments = signal(0);
  readonly requestedAppointments = signal(0);
  readonly pendingReschedules = signal(0);

  refresh(): void {
    switch (this.session.role()) {
      case 'USER':
        this.api.mine().subscribe({
          next: (items) => this.upcomingAppointments.set(items.filter(isUpcoming).length),
          error: () => this.upcomingAppointments.set(0),
        });
        break;
      case 'ADMIN':
        this.api.requested().subscribe({
          next: (items) => this.requestedAppointments.set(items.length),
          error: () => this.requestedAppointments.set(0),
        });
        this.api.pendingReschedules().subscribe({
          next: (items) => this.pendingReschedules.set(items.length),
          error: () => this.pendingReschedules.set(0),
        });
        break;
    }
  }
}

function isUpcoming(appointment: Appointment): boolean {
  const active = appointment.status === 'APPROVED' || appointment.status === 'REQUESTED';
  return active && new Date(`${appointment.date}T${appointment.startTime}`) > new Date();
}
