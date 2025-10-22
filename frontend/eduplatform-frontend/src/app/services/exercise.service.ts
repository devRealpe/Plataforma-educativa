import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exercise {
  id?: number;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  filePath?: string;
  fileName?: string;
  createdAt?: string;
  deadline?: string;
  courseId?: number;
}

export interface Hint {
  id?: number;
  content: string;
  order: number;
  cost: number;
  exerciseId?: number;
}

export interface Submission {
  id?: number;
  exerciseId?: number;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  filePath?: string;
  fileName?: string;
  submittedAt?: string;
  status?: string; // PENDING, GRADED, REJECTED
  grade?: number;
  feedback?: string;
  gradedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = 'http://localhost:8080/api/exercises';
  private hintsUrl = 'http://localhost:8080/api/hints';
  private submissionsUrl = 'http://localhost:8080/api/submissions';

  constructor(private http: HttpClient) {}

  // ========== EJERCICIOS ==========

  /**
   * Crear ejercicio (Profesor)
   */
  createExercise(exerciseData: Exercise, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exerciseData.title);
    formData.append('description', exerciseData.description);
    formData.append('difficulty', exerciseData.difficulty);
    formData.append('points', exerciseData.points.toString());
    formData.append('courseId', exerciseData.courseId!.toString());
    
    if (exerciseData.deadline) {
      formData.append('deadline', exerciseData.deadline);
    }
    
    if (file) {
      formData.append('file', file);
    }

    return this.http.post<Exercise>(this.apiUrl, formData);
  }

  /**
   * Obtener ejercicios de un curso
   */
  getExercisesByCourse(courseId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /**
   * Obtener un ejercicio por ID
   */
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar ejercicio
   */
  updateExercise(id: number, exerciseData: Exercise, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exerciseData.title);
    formData.append('description', exerciseData.description);
    formData.append('difficulty', exerciseData.difficulty);
    formData.append('points', exerciseData.points.toString());
    
    if (exerciseData.deadline) {
      formData.append('deadline', exerciseData.deadline);
    }
    
    if (file) {
      formData.append('file', file);
    }

    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Eliminar ejercicio
   */
  deleteExercise(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Descargar archivo del ejercicio
   */
  downloadExercise(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  // ========== PISTAS ==========

  /**
   * Crear pista
   */
  createHint(hint: Hint, exerciseId: number): Observable<Hint> {
    return this.http.post<Hint>(`${this.hintsUrl}?exerciseId=${exerciseId}`, hint);
  }

  /**
   * Obtener pistas de un ejercicio
   */
  getHintsByExercise(exerciseId: number): Observable<Hint[]> {
    return this.http.get<Hint[]>(`${this.hintsUrl}/exercise/${exerciseId}`);
  }

  /**
   * Actualizar pista
   */
  updateHint(id: number, hint: Hint): Observable<Hint> {
    return this.http.put<Hint>(`${this.hintsUrl}/${id}`, hint);
  }

  /**
   * Eliminar pista
   */
  deleteHint(id: number): Observable<any> {
    return this.http.delete(`${this.hintsUrl}/${id}`);
  }

  // ========== ENTREGAS ==========

  /**
   * Subir entrega (Estudiante)
   */
  submitExercise(exerciseId: number, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('exerciseId', exerciseId.toString());
    formData.append('file', file);

    return this.http.post<Submission>(this.submissionsUrl, formData);
  }

  /**
   * Obtener entregas de un ejercicio (Profesor)
   */
  getSubmissionsByExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionsUrl}/exercise/${exerciseId}`);
  }

  /**
   * Obtener mis entregas (Estudiante)
   */
  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionsUrl}/my-submissions`);
  }

  /**
   * Obtener una entrega por ID
   */
  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.submissionsUrl}/${id}`);
  }

  /**
   * Calificar entrega (Profesor)
   */
  gradeSubmission(id: number, grade: number, feedback: string): Observable<Submission> {
    return this.http.put<Submission>(`${this.submissionsUrl}/${id}/grade`, {
      grade,
      feedback
    });
  }

  /**
   * Descargar archivo de entrega
   */
  downloadSubmission(id: number): Observable<Blob> {
    return this.http.get(`${this.submissionsUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }
}