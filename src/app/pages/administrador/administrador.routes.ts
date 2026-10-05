import { Routes } from '@angular/router';
import { AdminSolicitudesPage } from './solicitudes/solicitudes';
import { ReprogramacionesPage } from './reprogramaciones/reprogramaciones';
import { ProfesionalesCatalogosPage } from './profesionales-catalogos/profesionales-catalogos';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  { path: 'solicitudes', title: 'Solicitudes especializadas · FCV Citas', component: AdminSolicitudesPage },
  { path: 'reprogramaciones', title: 'Reprogramaciones · FCV Citas', component: ReprogramacionesPage },
  { path: 'profesionales', title: 'Profesionales y catálogos · FCV Citas', component: ProfesionalesCatalogosPage },
  { path: 'catalogos', redirectTo: 'profesionales' },
];
