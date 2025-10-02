import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  title: string;
  description: string;
  level: string;
  inviteCode?: string;
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

  // ✅ Nuevo: Actualizar curso
  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course);
  }

  // ✅ Nuevo: Eliminar curso
  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  joinCourse(inviteCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join`, { inviteCode });
  }

  /**
 * Une a un estudiante a un curso usando el código de invitación
 */
joinCourseByCode(inviteCode: string): Observable<Course> {
  return this.http.post<Course>(
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
}