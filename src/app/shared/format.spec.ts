import { HttpErrorResponse } from '@angular/common/http';
import { STATUS_LABEL, apiMessage, fieldErrors, formatDate, hhmm } from './format';

describe('utilidades de presentación', () => {
  it('traduce todos los estados del catálogo fijo', () => {
    for (const code of ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'PENDING']) {
      expect(STATUS_LABEL[code]).toBeTruthy();
    }
  });

  it('formatea fecha sin desplazarla por zona horaria y recorta segundos', () => {
    expect(formatDate('2026-10-06')).toContain('6');
    expect(formatDate('2026-10-06')).toContain('2026');
    expect(hhmm('09:30:00')).toBe('09:30');
  });

  it('usa el mensaje del contrato de errores y los errores por campo', () => {
    const conflict = new HttpErrorResponse({ status: 409, error: { status: 409, message: 'La franja ya no está disponible', fieldErrors: [] } });
    expect(apiMessage(conflict, 'respaldo')).toBe('La franja ya no está disponible');
    const invalid = new HttpErrorResponse({ status: 400, error: { message: 'Revisa los datos enviados', fieldErrors: [{ field: 'phone', message: 'El teléfono debe tener entre 7 y 15 dígitos' }] } });
    expect(fieldErrors(invalid)['phone']).toContain('7 y 15');
    expect(apiMessage(new HttpErrorResponse({ status: 0 }), 'respaldo')).toBe('No fue posible conectar con la API.');
    expect(apiMessage(new HttpErrorResponse({ status: 500, error: null }), 'respaldo')).toBe('respaldo');
  });
});
