import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../../services/auth.service';
import { PlanItem, SchedulingApiService } from '../../services/scheduling-api.service';
import { SessionService } from '../../services/session.service';
import { DOCUMENT_TYPES, apiMessage, fieldErrors } from '../../shared/format';

type Mode = 'login' | 'register' | 'recovery';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <main class="min-h-screen grid place-items-center bg-surface p-6">
      <section class="w-full max-w-3xl grid gap-6 md:grid-cols-2">
        <div class="rounded-3xl bg-primary text-on-primary p-8 flex flex-col justify-between">
          <div>
            <p class="text-xs uppercase tracking-wider">FCV Citas</p>
            <h1 class="mt-3 text-3xl font-bold">Portal de acceso clínico</h1>
            <p class="mt-4 text-sm opacity-80">Proyecto académico con datos sintéticos. Inicia sesión o crea una cuenta de paciente.</p>
          </div>
          <p class="mt-8 text-xs opacity-70">Cada perfil (paciente, profesional o administración) ve únicamente las opciones de su rol.</p>
        </div>

        <div class="fcv-card space-y-4">
          <div class="flex flex-wrap gap-4 border-b border-outline-variant/30 pb-2" role="tablist">
            <button id="tab-login" type="button" role="tab" class="font-bold text-sm" [class.text-primary]="mode() === 'login'" [attr.aria-selected]="mode() === 'login'" (click)="switch('login')">Ingresar</button>
            <button id="tab-register" type="button" role="tab" class="font-bold text-sm" [class.text-primary]="mode() === 'register'" [attr.aria-selected]="mode() === 'register'" (click)="switch('register')">Registro</button>
            <button id="tab-recovery" type="button" role="tab" class="font-bold text-sm" [class.text-primary]="mode() === 'recovery'" [attr.aria-selected]="mode() === 'recovery'" (click)="switch('recovery')">Recuperar contraseña</button>
          </div>

          @if (message()) {
            <p id="login-message" [class]="error() ? 'fcv-alert-error' : 'fcv-alert-success'" role="status">{{ message() }}</p>
          }

          @switch (mode()) {
            @case ('login') {
              <form class="space-y-3" (ngSubmit)="login()" novalidate>
                <label class="fcv-label">Correo
                  <input class="fcv-input" name="email" type="email" autocomplete="username" [(ngModel)]="email" required>
                </label>
                <label class="fcv-label">Contraseña
                  <input class="fcv-input" name="password" type="password" autocomplete="current-password" [(ngModel)]="password" required>
                </label>
                <button id="btn-login" class="fcv-btn-primary w-full py-3" [disabled]="busy()">Iniciar sesión</button>
              </form>
            }

            @case ('register') {
              <form #registerForm="ngForm" class="space-y-2" (ngSubmit)="register(registerForm)" novalidate>
                <div class="grid grid-cols-2 gap-2">
                  <label class="fcv-label">Nombres
                    <input class="fcv-input" name="firstName" [(ngModel)]="form.firstName" #firstName="ngModel" required maxlength="80" [class.fcv-input-invalid]="show(firstName) || server()['firstName']">
                    @if (show(firstName) || server()['firstName']) { <span class="fcv-field-error">{{ server()['firstName'] || 'Ingresa tus nombres.' }}</span> }
                  </label>
                  <label class="fcv-label">Apellidos
                    <input class="fcv-input" name="lastName" [(ngModel)]="form.lastName" #lastName="ngModel" required maxlength="80" [class.fcv-input-invalid]="show(lastName) || server()['lastName']">
                    @if (show(lastName) || server()['lastName']) { <span class="fcv-field-error">{{ server()['lastName'] || 'Ingresa tus apellidos.' }}</span> }
                  </label>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <label class="fcv-label">Tipo
                    <select class="fcv-input" name="documentType" [(ngModel)]="form.documentType" required>
                      @for (type of documentTypes; track type.code) { <option [value]="type.code">{{ type.code }} · {{ type.name }}</option> }
                    </select>
                  </label>
                  <label class="fcv-label col-span-2">Número de documento
                    <input class="fcv-input" name="documentNumber" [(ngModel)]="form.documentNumber" #documentNumber="ngModel" required pattern="[A-Za-z0-9]{5,20}" [class.fcv-input-invalid]="show(documentNumber) || server()['documentNumber']">
                    @if (show(documentNumber) || server()['documentNumber']) { <span class="fcv-field-error">{{ server()['documentNumber'] || 'De 5 a 20 letras o números, sin puntos ni espacios.' }}</span> }
                  </label>
                </div>
                <label class="fcv-label">Correo
                  <input class="fcv-input" name="registerEmail" type="email" [(ngModel)]="form.email" #registerEmail="ngModel" required email [class.fcv-input-invalid]="show(registerEmail) || server()['email']">
                  @if (show(registerEmail) || server()['email']) { <span class="fcv-field-error">{{ server()['email'] || 'Ingresa un correo válido.' }}</span> }
                </label>
                <label class="fcv-label">Teléfono
                  <input class="fcv-input" name="phone" inputmode="numeric" [(ngModel)]="form.phone" #phone="ngModel" required pattern="\\d{7,15}" [class.fcv-input-invalid]="show(phone) || server()['phone']">
                  @if (show(phone) || server()['phone']) { <span class="fcv-field-error">{{ server()['phone'] || 'Solo dígitos, entre 7 y 15.' }}</span> }
                </label>
                <label class="fcv-label">Contraseña
                  <input class="fcv-input" name="registerPassword" type="password" autocomplete="new-password" [(ngModel)]="form.password" #registerPassword="ngModel" required minlength="8" [class.fcv-input-invalid]="show(registerPassword) || server()['password']">
                  @if (show(registerPassword) || server()['password']) { <span class="fcv-field-error">{{ server()['password'] || 'Mínimo 8 caracteres.' }}</span> }
                </label>
                <label class="fcv-label">Plan de afiliación (opcional)
                  <select class="fcv-input" name="plan" [(ngModel)]="form.planId">
                    <option [ngValue]="undefined">Sin plan por ahora</option>
                    @for (plan of plans(); track plan.id) { <option [ngValue]="plan.id">{{ plan.epsName }} · {{ plan.name }} ({{ plan.regimeName }})</option> }
                  </select>
                </label>
                <button id="btn-register" class="fcv-btn-primary w-full py-3" [disabled]="busy()">Crear cuenta</button>
              </form>
            }

            @case ('recovery') {
              <form class="space-y-3" (ngSubmit)="requestRecovery()" novalidate>
                <label class="fcv-label">Correo de la cuenta
                  <input class="fcv-input" name="recoveryEmail" type="email" [(ngModel)]="email" required>
                </label>
                <button id="btn-recovery" class="fcv-btn-primary w-full py-3" [disabled]="busy()">Enviar instrucciones</button>
              </form>
              <form class="space-y-3 border-t border-outline-variant/30 pt-4" (ngSubmit)="resetPassword()" novalidate>
                @if (developmentToken()) {
                  <p class="text-xs text-outline">Entorno de desarrollo: el token temporal (30 min, un solo uso) se completó automáticamente.</p>
                }
                <label class="fcv-label">Token de recuperación
                  <input class="fcv-input" name="resetToken" [(ngModel)]="resetToken" required>
                </label>
                <label class="fcv-label">Nueva contraseña
                  <input class="fcv-input" name="newPassword" type="password" autocomplete="new-password" [(ngModel)]="newPassword" required minlength="8">
                </label>
                <button id="btn-reset" class="fcv-btn-secondary w-full py-3" [disabled]="busy()">Cambiar contraseña</button>
              </form>
            }
          }
        </div>
      </section>
    </main>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly api = inject(SchedulingApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly documentTypes = DOCUMENT_TYPES;
  readonly mode = signal<Mode>('login');
  readonly plans = signal<PlanItem[]>([]);
  readonly message = signal('');
  readonly error = signal(false);
  readonly busy = signal(false);
  readonly submitted = signal(false);
  readonly server = signal<Record<string, string>>({});
  readonly developmentToken = signal(false);

  email = '';
  password = '';
  resetToken = '';
  newPassword = '';
  form = { firstName: '', lastName: '', documentType: 'CC', documentNumber: '', email: '', phone: '', password: '', planId: undefined as number | undefined };

  constructor() {
    this.api.plans().subscribe({ next: (plans) => this.plans.set(plans) });
  }

  switch(mode: Mode): void {
    this.mode.set(mode);
    this.message.set('');
    this.server.set({});
    this.submitted.set(false);
  }

  show(control: { invalid: boolean | null; touched: boolean | null }): boolean {
    return !!control.invalid && (!!control.touched || this.submitted());
  }

  login(): void {
    if (!this.email || !this.password) return this.fail('Ingresa correo y contraseña.');
    this.busy.set(true);
    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: (response) => this.go(response.user),
      error: (e) => {
        this.busy.set(false);
        this.fail(e.status === 401 ? 'Credenciales inválidas.' : apiMessage(e, 'No fue posible iniciar sesión.'));
      },
    });
  }

  register(form: NgForm): void {
    this.submitted.set(true);
    this.server.set({});
    if (form.invalid) return this.fail('Revisa los campos marcados.');
    this.busy.set(true);
    const { planId, ...data } = this.form;
    this.auth.register({ ...data, email: data.email.trim(), insurancePlanId: planId }).subscribe({
      next: (response) => this.go(response.user),
      error: (e) => {
        this.busy.set(false);
        this.server.set(fieldErrors(e));
        this.fail(apiMessage(e, 'No fue posible crear la cuenta.'));
      },
    });
  }

  requestRecovery(): void {
    if (!this.email) return this.fail('Ingresa el correo de la cuenta.');
    this.busy.set(true);
    this.auth.requestPasswordRecovery(this.email.trim()).subscribe({
      next: (response) => {
        this.busy.set(false);
        this.developmentToken.set(!!response.developmentToken);
        if (response.developmentToken) this.resetToken = response.developmentToken;
        this.ok('Si la cuenta existe, recibirás instrucciones para cambiar la contraseña.');
      },
      error: (e) => {
        this.busy.set(false);
        this.fail(apiMessage(e, 'No fue posible procesar la solicitud.'));
      },
    });
  }

  resetPassword(): void {
    if (this.newPassword.length < 8) return this.fail('La nueva contraseña debe tener al menos 8 caracteres.');
    this.busy.set(true);
    this.auth.resetPassword(this.resetToken.trim(), this.newPassword).subscribe({
      next: () => {
        this.busy.set(false);
        this.mode.set('login');
        this.password = '';
        this.newPassword = '';
        this.resetToken = '';
        this.developmentToken.set(false);
        this.ok('Contraseña actualizada. Ya puedes iniciar sesión.');
      },
      error: (e) => {
        this.busy.set(false);
        this.fail(apiMessage(e, 'Token inválido o vencido.'));
      },
    });
  }

  private go(user: AuthUser): void {
    this.session.start(user);
    this.router.navigateByUrl(this.session.home());
  }

  private ok(text: string): void {
    this.message.set(text);
    this.error.set(false);
  }

  private fail(text: string): void {
    this.message.set(text);
    this.error.set(true);
  }
}
