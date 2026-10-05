import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ShellComponent } from './components/layout/shell';
import { authGuard, guestGuard, roleMatch } from './auth.guard';
import { SessionService } from './services/session.service';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Ingresar · FCV Citas',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'paciente',
        canMatch: [roleMatch('USER')],
        loadChildren: () => import('./pages/paciente/paciente.routes').then((m) => m.PACIENTE_ROUTES),
      },
      {
        path: 'profesional',
        canMatch: [roleMatch('PROFESSIONAL')],
        loadChildren: () => import('./pages/profesional/profesional.routes').then((m) => m.PROFESIONAL_ROUTES),
      },
      {
        path: 'administrador',
        canMatch: [roleMatch('ADMIN')],
        loadChildren: () => import('./pages/administrador/administrador.routes').then((m) => m.ADMINISTRADOR_ROUTES),
      },
      // Rutas de otro rol o desconocidas: inicio del rol de la sesión (o login sin sesión).
      { path: '**', redirectTo: () => inject(SessionService).home() },
    ],
  },
];
