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

  // ✅ LOGIN exitoso
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

  // ✅ Manejo de token en localStorage
  it('debería guardar y leer token con saveToken/getToken y luego eliminar con logout', () => {
    expect(service.getToken()).toBeNull();
    service.saveToken('abc-123-token');
    expect(service.getToken()).toBe('abc-123-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });

  // ✅ REGISTRO exitoso
  it('CP001: debería registrar un nuevo usuario exitosamente', (done) => {
    const newUser = {
      nombre: 'Milagros',
      email: 'milagros@gmail.com',
      password: '123456',
      role: 'STUDENT'
    };

    const mockResp = {
      token: 'fake-jwt-token',
      email: 'milagros@gmail.com',
      name: 'Milagros',
      role: 'STUDENT'
    };

    service.register(newUser).subscribe(res => {
      expect(res).toEqual(mockResp);
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResp);
  });

  // ❌ REGISTRO fallido (correo duplicado)
  it('CP001: debería rechazar el registro si el correo ya está registrado', (done) => {
    const newUser = {
      nombre: 'Carlitos',
      email: 'milagros@gmail.com', // mismo correo que otro usuario
      password: '123456',
      role: 'STUDENT'
    };

    service.register(newUser).subscribe({
      next: () => fail('no debería permitir registrar un correo duplicado'),
      error: err => {
        expect(err.status).toBe(400);
        expect(err.error.message).toBe('El correo ya está registrado');
        done();
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    req.flush({ message: 'El correo ya está registrado' }, { status: 400, statusText: 'Bad Request' });
  });

  // ❌ LOGIN fallido
  it('CP001: debería propagar error 401 en login fallido', (done) => {
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

    // ✅ CP002: Login exitoso con credenciales de Giovanny
  it('CP002 - debería hacer login exitoso con email giovanny@gmail.com y password Giovanny', (done) => {
    const mockResponse: LoginResponse = {
      token: 'jwt-token-giovanny',
      email: 'giovanny@gmail.com',
      name: 'Giovanny',
      role: 'USER'
    };

    service.login('giovanny@gmail.com', 'Giovanny').subscribe(res => {
      expect(res).toEqual(mockResponse);
      expect(res.token).toBe('jwt-token-giovanny');
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'giovanny@gmail.com', password: 'Giovanny' });
    req.flush(mockResponse);
  });

  // ❌ CP002: Login fallido con contraseña incorrecta
  it('CP002 - debería rechazar login con email correcto pero password incorrecto', (done) => {
    service.login('giovanny@gmail.com', 'Nico').subscribe({
      next: () => fail('no debería autenticarse con credenciales incorrectas'),
      error: err => {
        expect(err.status).toBe(401);
        expect(err.error.message).toBe('Credenciales incorrectas');
        done();
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'giovanny@gmail.com', password: 'Nico' });
    req.flush({ message: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' });
  });


    // ✅ HU3 - REGISTRO de docente exitoso
  it('CP003: debería registrar un nuevo docente exitosamente', (done) => {
    const newTeacher = {
      nombre: 'Mavelin',
      email: 'mavelin@gmail.com',
      password: '123456',
      role: 'TEACHER'
    };

    const mockResp = {
      token: 'fake-jwt-token',
      email: 'mavelin@gmail.com',
      name: 'Mavelin',
      role: 'TEACHER'
    };

    service.register(newTeacher).subscribe(res => {
      expect(res).toEqual(mockResp);
      expect(res.role).toBe('TEACHER');
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTeacher);
    req.flush(mockResp);
  });

  // ❌ HU3 - REGISTRO fallido (docente con correo duplicado)
  it('CP003: debería rechazar el registro de un docente si el correo ya está registrado', (done) => {
    const newTeacher = {
      nombre: 'Julieta',
      email: 'mavelin@gmail.com', // correo ya registrado
      password: '123456',
      role: 'TEACHER'
    };

    service.register(newTeacher).subscribe({
      next: () => fail('no debería permitir registrar un docente con correo duplicado'),
      error: err => {
        expect(err.status).toBe(400);
        expect(err.error.message).toBe('El correo ya está registrado');
        done();
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTeacher);
    req.flush({ message: 'El correo ya está registrado' }, { status: 400, statusText: 'Bad Request' });
  });

    // ❌ LOGIN fallido
  it('CP003: debería propagar error 401 en login fallido', (done) => {
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

    // ✅ HU4 - LOGIN exitoso con credenciales válidas
  it('CP004: debería hacer login exitoso con email madelin@gmail.com y password Madelin', (done) => {
    const mockResponse: LoginResponse = {
      token: 'jwt-token-madelin',
      email: 'madelin@gmail.com',
      name: 'Madelin',
      role: 'USER'
    };

    service.login('madelin@gmail.com', 'Madelin').subscribe(res => {
      expect(res).toEqual(mockResponse);
      expect(res.token).toBe('jwt-token-madelin');
      done();
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'madelin@gmail.com', password: 'Madelin' });
    req.flush(mockResponse);
  });

  // ❌ HU4 - LOGIN fallido con credenciales incorrectas
  it('CP004: debería rechazar login con email madeliny@gmail.com y password 123456', (done) => {
    service.login('madeliny@gmail.com', '123456').subscribe({
      next: () => fail('no debería autenticarse con credenciales incorrectas'),
      error: err => {
        expect(err.status).toBe(401);
        expect(err.error.message).toBe('Credenciales incorrectas');
        done();
      }
    });

    const req = httpMock.expectOne(`${baseUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'madeliny@gmail.com', password: '123456' });
    req.flush({ message: 'Credenciales incorrectas' }, { status: 401, statusText: 'Unauthorized' });
  });


});

