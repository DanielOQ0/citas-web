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
import { authGuard } from './auth.guard';

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
        component: PacienteInicioPage,
      },
      {
        path: 'paciente/buscar-disponibilidad',
        component: BuscarDisponibilidadPage,
      },
      {
        path: 'paciente/mis-citas',
        component: MisCitasPage,
      },
      {
        path: 'paciente/perfil',
        component: PerfilPage,
      },
      {
        path: 'profesional/mi-agenda',
        component: MiAgendaPage,
      },
      {
        path: 'administrador/solicitudes',
        component: AdminSolicitudesPage,
      },
      {
        path: 'administrador/profesionales',
        component: ProfesionalesCatalogosPage,
      },
      {
        path: 'administrador/reprogramaciones',
        component: ReprogramacionesPage,
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
