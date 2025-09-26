// src/app/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, LoginResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.removeItem('token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('debería llamar al endpoint de login y devolver la respuesta', (done) => {
    const mockResponse: LoginResponse = {
      token: 'fake-jwt-token',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER'
    };

    service.login('test@example.com', '123456').subscribe(res => {
      expect(res).toEqual(mockResponse);
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com', password: '123456' });
    req.flush(mockResponse);
  });

  it('debería guardar y leer token con saveToken/getToken y luego eliminar con logout', () => {
    expect(service.getToken()).toBeNull();
    service.saveToken('abc-123-token');
    expect(service.getToken()).toBe('abc-123-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  it('debería llamar al endpoint de register y devolver el usuario creado', (done) => {
    const newUser = {
      nombre: 'Nuevo Usuario',
      email: 'new@example.com',
      password: '123456',
      role: 'USER'
    };

    const mockResp = { id: 1, email: 'new@example.com', nombre: 'Nuevo Usuario', role: 'USER' };

    service.register(newUser).subscribe(res => {
      expect(res).toEqual(mockResp);
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResp);
  });

  it('debería propagar error 401 en login fallido', (done) => {
    service.login('wrong@example.com', 'badpass').subscribe({
      next: () => fail('no debería entrar en next'),
      error: err => {
        expect(err.status).toBe(401);
        done();
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
