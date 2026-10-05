import { Injectable, signal } from '@angular/core';

export interface ToastInfo {
  show: boolean;
  title: string;
  message: string;
  icon: string;
  type: 'success' | 'error' | 'info';
}

/** Notificaciones tipo toast de la interfaz. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toast = signal<ToastInfo>({ show: false, title: '', message: '', icon: 'check_circle', type: 'success' });
  private timer?: ReturnType<typeof setTimeout>;

  show(title: string, message: string, type: ToastInfo['type'] = 'success', icon = type === 'error' ? 'error' : 'check_circle'): void {
    clearTimeout(this.timer);
    this.toast.set({ show: true, title, message, icon, type });
    this.timer = setTimeout(() => this.hide(), 4500);
  }

  hide(): void {
    this.toast.update((toast) => ({ ...toast, show: false }));
  }
}
