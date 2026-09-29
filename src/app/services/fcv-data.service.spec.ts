import { FcvDataService } from './fcv-data.service';

describe('FcvDataService', () => {
  it('sincroniza el usuario autenticado real y su rol', () => {
    const service = new FcvDataService();
    service.setAuthenticatedUser({ id: 42, name: 'Ana Prueba', email: 'ana@example.test', roles: ['USER'] });
    expect(service.currentUser().id).toBe('42');
    expect(service.currentUser().name).toBe('Ana Prueba');
    expect(service.currentUser().email).toBe('ana@example.test');
    expect(service.currentUser().role).toBe('USER');
    expect(service.isAuthenticated()).toBe(true);
  });
});
