import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

// ✅ Respuesta del login (con token)
export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;
}

// ✅ Perfil del usuario (sin token) - Exportada para usarla en componentes
export interface UserProfile {
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage() {
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
  }

  /**
   * Login
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: LoginResponse) => {
        if (response.token) {
          this.saveToken(response.token);
          
          const user: UserProfile = {
            email: response.email,
            name: response.name,
            role: response.role
          };
          
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  /**
   * Registro
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /**
   * Actualizar perfil (nombre)
   */
  updateProfile(nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, { nombre }).pipe(
      tap((response: any) => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser && response.name) {
          const updatedUser = { ...currentUser, name: response.name };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  /**
   * Guardar token
   */
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener rol del usuario
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Verificar si es profesor
   */
  isTeacher(): boolean {
    return this.getUserRole() === 'TEACHER';
  }

  /**
   * Verificar si es estudiante
   */
  isStudent(): boolean {
    return this.getUserRole() === 'STUDENT';
  }
}