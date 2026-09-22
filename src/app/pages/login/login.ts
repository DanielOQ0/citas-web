import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FcvDataService } from '../../services/fcv-data.service';
import { ToastComponent } from '../../components/toast/toast';
import { UserRole } from '../../models/fcv.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ToastComponent],
  template: `
    <div class="min-h-screen bg-surface flex flex-col justify-center lg:py-0">
      <div class="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        <!-- Columna Izquierda: Formulario de Acceso Clínico -->
        <div class="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 bg-surface-container-lowest">
          <!-- Top bar con logo y badge de prototipo -->
          <div>
            <div class="flex items-center justify-between mb-8 sm:mb-12">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-md shadow-primary/20">
                  <span class="material-symbols-outlined text-2xl">local_hospital</span>
                </div>
                <div>
                  <span class="font-headline-sm text-xl font-bold tracking-tight text-primary block leading-none">
                    FCV Citas
                  </span>
                  <span class="text-xs text-on-surface-variant font-medium">
                    Hospital Universitario FCV
                  </span>
                </div>
              </div>

              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-semibold border border-outline-variant/40">
                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span>Prototipo académico · Datos ficticios</span>
              </div>
            </div>

            <!-- Titulares principales -->
            <div class="max-w-md">
              <h1 class="font-headline-md text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                Portal de Acceso Clínico
              </h1>
              <p class="font-body-md text-on-surface-variant mt-2 text-sm">
                Ingrese sus credenciales institucionales para acceder a la gestión hospitalaria y agendamiento ambulatorio.
              </p>
            </div>

            <!-- Accesos rápidos para evaluación y demostración -->
            <div class="mt-6 p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/30 max-w-md">
              <span class="text-[11px] font-bold uppercase tracking-wider text-outline block mb-2">
                Accesos directos para evaluación inmediata:
              </span>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-quick-paciente"
                  (click)="fillCredentials('carlos.perez@fcv.edu.co', 'USER')"
                  class="px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary text-xs font-medium text-on-surface transition-all text-left flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-primary text-sm">person</span>
                  <span>Paciente</span>
                </button>
                <button
                  type="button"
                  id="btn-quick-medico"
                  (click)="fillCredentials('camilo.restrepo@fcv.edu.co', 'PROFESSIONAL')"
                  class="px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary text-xs font-medium text-on-surface transition-all text-left flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-secondary text-sm">stethoscope</span>
                  <span>Médico</span>
                </button>
                <button
                  type="button"
                  id="btn-quick-admin"
                  (click)="fillCredentials('admin@fcv.edu.co', 'ADMIN')"
                  class="px-2.5 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary text-xs font-medium text-on-surface transition-all text-left flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-primary text-sm">shield_person</span>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <!-- Formulario Reactivo con Validación Estricta -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-6 space-y-4 max-w-md">
              @if (errorMessage()) {
                <div class="p-3.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2 border border-error/20">
                  <span class="material-symbols-outlined text-lg shrink-0">error</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Campo Email -->
              <div>
                <label for="email" class="block font-label-md text-xs font-semibold text-on-surface mb-1.5">
                  Correo electrónico institucional
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span class="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    placeholder="ejemplo@fcv.edu.co"
                    class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  />
                </div>
                @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
                  <p class="text-[11px] text-error mt-1">Ingrese un correo institucional válido (ej: usuario&#64;fcv.edu.co).</p>
                }
              </div>

              <!-- Campo Password con toggle ocultar/mostrar -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="password" class="block font-label-md text-xs font-semibold text-on-surface">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    (click)="showForgotPasswordModal.set(true)"
                    class="text-xs font-medium text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <span class="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="••••••••••••"
                    class="w-full pl-10 pr-11 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface"
                    aria-label="Alternar visibilidad de contraseña"
                  >
                    <span class="material-symbols-outlined text-lg">
                      {{ showPassword() ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Botón Submit -->
              <div class="pt-2">
                <button
                  type="submit"
                  id="btn-login-submit"
                  [disabled]="isSubmitting()"
                  class="w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  @if (isSubmitting()) {
                    <span class="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    <span>Validando credenciales...</span>
                  } @else {
                    <span>Iniciar sesión</span>
                    <span class="material-symbols-outlined text-base">arrow_forward</span>
                  }
                </button>
              </div>

              <!-- Registro de nuevo paciente -->
              <div class="text-center pt-2">
                <p class="text-xs text-on-surface-variant">
                  ¿Nuevo en FCV Citas?
                  <button
                    type="button"
                    (click)="showRegisterModal.set(true)"
                    class="font-semibold text-primary hover:underline ml-1"
                  >
                    Registrarse como paciente
                  </button>
                </p>
              </div>
            </form>
          </div>

          <!-- Footer con estado de sesión -->
          <div class="pt-8 border-t border-outline-variant/30 text-xs text-outline flex items-center justify-between">
            <span>Estado de sesión: Sesión segura TLS</span>
            <span>Versión 0.9.4-dev</span>
          </div>
        </div>

        <!-- Columna Derecha: Panel Institucional Hospitalario Azul Oscuro -->
        <div class="lg:col-span-5 bg-primary p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-on-primary relative overflow-hidden">
          <div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-primary-container/40 blur-3xl pointer-events-none"></div>

          <div>
            <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-8 shadow-inner">
              <span class="material-symbols-outlined text-3xl text-on-primary">local_hospital</span>
            </div>

            <h2 class="font-headline-lg text-3xl font-bold tracking-tight text-white mb-4">
              Hospital Universitario FCV
            </h2>
            <p class="text-white/80 font-body-lg text-base leading-relaxed mb-8">
              Sistema unificado de gestión de citas ambulatorias, auditoría inmutable de estados y coordinación asistencial con datos sintéticos para fines académicos.
            </p>

            <div class="space-y-4">
              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="material-symbols-outlined text-primary-fixed mt-0.5">verified_user</span>
                <div>
                  <h3 class="text-sm font-semibold text-white">HU-002: Autenticación Segura</h3>
                  <p class="text-xs text-white/70">Control de acceso con perfiles estrictos y contraseñas cifradas.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="material-symbols-outlined text-secondary-container mt-0.5">event_repeat</span>
                <div>
                  <h3 class="text-sm font-semibold text-white">HU-017 / HU-020: Flujos Asistenciales</h3>
                  <p class="text-xs text-white/70">Aprobación de interconsultas especializadas y conciliación de reprogramaciones.</p>
                </div>
              </div>

              <div class="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span class="material-symbols-outlined text-primary-fixed mt-0.5">history_edu</span>
                <div>
                  <h3 class="text-sm font-semibold text-white">HU-025: Auditoría Inmutable</h3>
                  <p class="text-xs text-white/70">Registro cronológico detallado de actores, fuentes y cambios de estado.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-8 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
            <span>Bucaramanga · Floridablanca, Colombia</span>
            <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium text-[11px]">
              Sedes Norte y Sur
            </span>
          </div>
        </div>
      </div>

      <!-- Modal interactivo: Recuperar Contraseña -->
      @if (showForgotPasswordModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                <h3 class="font-title-lg font-bold text-on-surface">Restablecimiento de Contraseña</h3>
              </div>
              <button
                type="button"
                (click)="showForgotPasswordModal.set(false)"
                class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <p class="text-xs text-on-surface-variant">
              En este entorno de prototipo académico (HU-002), ingrese su correo para generar un token sintético demostrativo de recuperación.
            </p>

            <div>
              <label for="input-reset-email" class="block text-xs font-semibold text-on-surface mb-1">Correo electrónico</label>
              <input
                type="email"
                id="input-reset-email"
                [value]="loginForm.value.email || 'carlos.perez@fcv.edu.co'"
                class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm"
                readonly
              />
            </div>

            <div class="p-3.5 rounded-xl bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim space-y-1">
              <span class="text-[11px] font-bold uppercase tracking-wider block">Token Demostrativo Generado:</span>
              <p class="font-mono font-bold text-base tracking-widest text-primary">FCV-RESET-984210</p>
              <p class="text-[11px] text-on-primary-fixed-variant">Válido durante 15 minutos en el sandbox local.</p>
            </div>

            <button
              type="button"
              (click)="confirmResetPassword()"
              class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-md"
            >
              Simular Restablecimiento y Cerrar
            </button>
          </div>
        </div>
      }

      <!-- Modal interactivo: Registro de Paciente -->
      @if (showRegisterModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-xs">
          <div class="w-full max-w-md bg-surface-container-lowest rounded-2xl p-6 shadow-2xl border border-outline-variant/40 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-2xl">person_add</span>
                <h3 class="font-title-lg font-bold text-on-surface">Auto-registro de Paciente</h3>
              </div>
              <button
                type="button"
                (click)="showRegisterModal.set(false)"
                class="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <p class="text-xs text-on-surface-variant">
              (HU-004) Conforme a la política asistencial, los pacientes pueden afiliarse con su documento y EPS vinculada para agendar citas de Medicina General y Especializada.
            </p>

            <div class="space-y-3">
              <div>
                <label for="input-reg-name" class="block text-xs font-semibold text-on-surface mb-1">Nombre Completo</label>
                <input
                  type="text"
                  id="input-reg-name"
                  #regName
                  value="Carlos Andrés Pérez"
                  class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label for="input-reg-doc" class="block text-xs font-semibold text-on-surface mb-1">Documento (CC)</label>
                  <input
                    type="text"
                    id="input-reg-doc"
                    value="1.098.765.432"
                    class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label for="select-reg-eps" class="block text-xs font-semibold text-on-surface mb-1">EPS Habilitada</label>
                  <select id="select-reg-eps" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm">
                    <option>EPS Demo A (Plan Demo 1)</option>
                    <option>EPS Demo B (Plan Integral)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="confirmRegister(regName.value)"
              class="w-full py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-md"
            >
              Completar Registro y Entrar como Paciente
            </button>
          </div>
        </div>
      }

      <app-toast />
    </div>
  `,
})
export class LoginPage {
  readonly fcvService = inject(FcvDataService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly showForgotPasswordModal = signal<boolean>(false);
  readonly showRegisterModal = signal<boolean>(false);

  readonly loginForm = new FormGroup({
    email: new FormControl('carlos.perez@fcv.edu.co', [Validators.required, Validators.email]),
    password: new FormControl('password123', [Validators.required, Validators.minLength(4)]),
  });

  fillCredentials(email: string, role: UserRole) {
    this.loginForm.patchValue({ email, password: 'password123' });
    this.errorMessage.set('');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor complete los campos requeridos correctamente.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.loginForm.value.email || '', password: this.loginForm.value.password || '' }).subscribe({
      next: (response) => {
        const role = response.user.roles[0] || 'USER';
        this.fcvService.switchUserRole(role);
        this.isSubmitting.set(false);
        this.router.navigateByUrl(role === 'ADMIN' ? '/administrador/solicitudes' : role === 'PROFESSIONAL' ? '/profesional/mi-agenda' : '/paciente/inicio');
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.status === 0 ? 'No fue posible conectar con el servicio de citas.' : 'Credenciales inválidas. Verifique sus datos e intente nuevamente.');
      },
    });
  }

  confirmResetPassword() {
    this.showForgotPasswordModal.set(false);
    this.fcvService.showToast('Contraseña restablecida', 'Se ha simulado el cambio de credenciales para el entorno sandbox.', 'check_circle');
  }

  confirmRegister(name: string) {
    this.showRegisterModal.set(false);
    this.fcvService.switchUserRole('USER');
    this.fcvService.showToast('Registro exitoso', `Bienvenido al sistema ambulatorio FCV, ${name}.`, 'verified');
    this.router.navigateByUrl('/paciente/inicio');
  }
}
