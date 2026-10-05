import { Routes } from '@angular/router';
import { AdminSolicitudesPage } from './solicitudes/solicitudes';
import { ReprogramacionesPage } from './reprogramaciones/reprogramaciones';
import { ProfesionalesPage } from './profesionales/profesionales';
import { EspecialidadesPage } from './especialidades/especialidades';
import { EpsPlanesPage } from './eps-planes/eps-planes';

export const ADMINISTRADOR_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'solicitudes' },
  { path: 'solicitudes', title: 'Solicitudes especializadas · FCV Citas', component: AdminSolicitudesPage },
  { path: 'reprogramaciones', title: 'Reprogramaciones · FCV Citas', component: ReprogramacionesPage },
  { path: 'profesionales', title: 'Profesionales · FCV Citas', component: ProfesionalesPage },
  { path: 'especialidades', title: 'Especialidades · FCV Citas', component: EspecialidadesPage },
  { path: 'eps-planes', title: 'EPS y planes · FCV Citas', component: EpsPlanesPage },
  { path: 'catalogos', redirectTo: 'especialidades' },
];
