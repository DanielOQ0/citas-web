import { Routes } from '@angular/router';
import { MiAgendaPage } from './mi-agenda/mi-agenda';

export const PROFESIONAL_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'mi-agenda' },
  { path: 'mi-agenda', title: 'Mi agenda · FCV Citas', component: MiAgendaPage },
];
