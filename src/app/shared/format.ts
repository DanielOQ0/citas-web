import { HttpErrorResponse } from '@angular/common/http';

/** Etiquetas en español de los estados del contrato (catálogos fijos RF-05). */
export const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Solicitada',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Atendida',
  NO_SHOW: 'No asistió',
  PENDING: 'Pendiente',
};

export const STATUS_CLASS: Record<string, string> = {
  REQUESTED: 'bg-secondary-fixed text-on-secondary-fixed',
  APPROVED: 'bg-primary-fixed text-on-primary-fixed',
  REJECTED: 'bg-error-container text-on-error-container',
  CANCELLED: 'bg-surface-container-high text-on-surface-variant',
  COMPLETED: 'bg-emerald-100 text-emerald-900',
  NO_SHOW: 'bg-amber-100 text-amber-900',
  PENDING: 'bg-secondary-fixed text-on-secondary-fixed',
};

export const SOURCE_LABEL: Record<string, string> = { SYSTEM: 'Sistema', USER: 'Usuario', ADMIN: 'Administración' };

export const DOCUMENT_TYPES = [
  { code: 'CC', name: 'Cédula de ciudadanía' },
  { code: 'CE', name: 'Cédula de extranjería' },
  { code: 'TI', name: 'Tarjeta de identidad' },
  { code: 'PA', name: 'Pasaporte' },
];

const DATE = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "mar, 6 oct 2026" a partir de YYYY-MM-DD (sin desplazamientos de zona). */
export function formatDate(date: string): string {
  return date ? DATE.format(new Date(`${date}T00:00:00Z`)) : '';
}

export function hhmm(time: string | undefined | null): string {
  return time ? time.slice(0, 5) : '';
}

export function formatDateTime(value: string): string {
  return value ? `${formatDate(value.slice(0, 10))} · ${hhmm(value.slice(11, 16))}` : '';
}

export function isFuture(date: string, time: string): boolean {
  return new Date(`${date}T${hhmm(time)}`) > new Date();
}

export function todayIso(offsetDays = 0): string {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

/** Mensaje del backend ({message}) o uno de respaldo; sin conexión, un mensaje explícito. */
export function apiMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No fue posible conectar con la API.';
    const message = (error.error as { message?: string } | null)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

/** Errores por campo del backend ({fieldErrors:[{field,message}]}). */
export function fieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (error instanceof HttpErrorResponse) {
    const items = (error.error as { fieldErrors?: { field: string; message: string }[] } | null)?.fieldErrors ?? [];
    for (const item of items) result[item.field] = item.message;
  }
  return result;
}
