import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
  role: string;

  username?: string;
  bio?: string;
  location?: string;
  level?: number;
  xp?: number;
  coursesCompleted?: number;
  challengesWon?: number;
  studyDays?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  // Login
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

    // 👉 Nuevo método para obtener perfil
  getProfile(): Observable<LoginResponse> {
    return this.http.get<LoginResponse>(`${this.apiUrl}/me`);
  }

  // Guardar token
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Registro (opcional)
  register(userData: { nombre: string; email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
