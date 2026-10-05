import { Routes } from '@angular/router';
import { PacienteInicioPage } from './inicio/paciente-inicio';
import { BuscarDisponibilidadPage } from './buscar-disponibilidad/buscar-disponibilidad';
import { MisCitasPage } from './mis-citas/mis-citas';
import { PerfilPage } from './perfil/perfil';

export const PACIENTE_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: 'inicio', title: 'Resumen de citas · FCV Citas', component: PacienteInicioPage },
  { path: 'buscar-disponibilidad', title: 'Buscar disponibilidad · FCV Citas', component: BuscarDisponibilidadPage },
  { path: 'mis-citas', title: 'Mis citas · FCV Citas', component: MisCitasPage },
  { path: 'perfil', title: 'Mi perfil · FCV Citas', component: PerfilPage },
];
