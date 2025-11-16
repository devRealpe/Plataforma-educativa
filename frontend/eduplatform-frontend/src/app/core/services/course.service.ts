import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  title: string;
  description: string;
  level: string;
  inviteCode?: string;
  teacherName?: string;
  teacherEmail?: string;
  studentCount?: number;
  whatsappLink?: string; 
  hasWhatsappLink?: boolean;
}

export interface JoinCourseResponse {
  message: string;
  course: Course;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Une a un estudiante a un curso usando el código de invitación
   */
  joinCourseByCode(inviteCode: string): Observable<JoinCourseResponse> {
    return this.http.post<JoinCourseResponse>(
      `${this.apiUrl}/join`,
      { inviteCode }
    );
  }

  /**
   * Obtiene todos los cursos en los que el estudiante está inscrito
   */
  getEnrolledCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.apiUrl}/enrolled`);
  }

  /**
   * Obtiene el progreso del estudiante en un curso específico
   */
  getCourseProgress(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${courseId}/progress`);
  }

  /**
   * Permite al estudiante abandonar un curso
   */
  leaveCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}/leave`);
  }

  // ========================================
// AGREGAR AL FINAL DE course.service.ts
// ========================================

  // ========================================
  // ✅ NUEVO: Gestión de enlace de WhatsApp
  // ========================================

  /**
   * Configurar o actualizar enlace de WhatsApp (Profesor)
   */
  setWhatsappLink(courseId: number, whatsappLink: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${courseId}/whatsapp`,
      { whatsappLink }
    );
  }

  /**
   * Eliminar enlace de WhatsApp (Profesor)
   */
  removeWhatsappLink(courseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}/whatsapp`);
  }

  /**
   * Obtener enlace de WhatsApp (Estudiante o Profesor)
   */
  getWhatsappLink(courseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${courseId}/whatsapp`);
  }
}
