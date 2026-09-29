import { Routes } from '@angular/router';
import { ShellComponent } from './components/layout/shell';
import { LoginPage } from './pages/login/login';
import { PacienteInicioPage } from './pages/paciente/inicio/paciente-inicio';
import { BuscarDisponibilidadPage } from './pages/paciente/buscar-disponibilidad/buscar-disponibilidad';
import { MisCitasPage } from './pages/paciente/mis-citas/mis-citas';
import { PerfilPage } from './pages/paciente/perfil/perfil';
import { MiAgendaPage } from './pages/profesional/mi-agenda/mi-agenda';
import { AdminSolicitudesPage } from './pages/administrador/solicitudes/solicitudes';
import { ProfesionalesCatalogosPage } from './pages/administrador/profesionales-catalogos/profesionales-catalogos';
import { ReprogramacionesPage } from './pages/administrador/reprogramaciones/reprogramaciones';
import { authGuard, roleGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'paciente/inicio',
      },
      {
        path: 'paciente/inicio',
        component: PacienteInicioPage, canActivate: [roleGuard(['USER'])],
      },
      {
        path: 'paciente/buscar-disponibilidad',
        component: BuscarDisponibilidadPage, canActivate: [roleGuard(['USER'])],
      },
      {
        path: 'paciente/mis-citas',
        component: MisCitasPage, canActivate: [roleGuard(['USER'])],
      },
      {
        path: 'paciente/perfil',
        component: PerfilPage, canActivate: [roleGuard(['USER'])],
      },
      {
        path: 'profesional/mi-agenda',
        component: MiAgendaPage, canActivate: [roleGuard(['PROFESSIONAL'])],
      },
      {
        path: 'administrador/solicitudes',
        component: AdminSolicitudesPage, canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'administrador/profesionales',
        component: ProfesionalesCatalogosPage, canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'administrador/reprogramaciones',
        component: ReprogramacionesPage, canActivate: [roleGuard(['ADMIN'])],
      },
      {
        path: 'administrador/catalogos',
        redirectTo: 'administrador/profesionales',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'paciente/inicio',
  },
];
