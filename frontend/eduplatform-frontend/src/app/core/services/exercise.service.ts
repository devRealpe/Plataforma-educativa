import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// ========================================
// INTERFACES
// ========================================

export interface Exercise {
  id?: number;
  title: string;
  description: string;
  difficulty: string;
  fileName?: string;
  fileType?: string;
  deadline?: string;
  createdAt?: string;
  courseId?: number;
  hasFile?: boolean;
  hints?: Hint[];
}

export interface Hint {
  id?: number;
  content: string;
  order: number;
  exerciseId?: number;
  createdAt?: string;
}

export interface Submission {
  id?: number;
  exerciseId?: number;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  fileName?: string;
  fileType?: string;
  submittedAt?: string;
  status?: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  hasFile?: boolean;
  published?: boolean;
  lastModifiedAt?: string;
  editCount?: number;
  canBeEdited?: boolean;
  daysUntilDeadline?: number;
  exerciseDeadline?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  // 🔥 CORREGIDO: Rutas según el controlador real
  private apiUrl = `${environment.apiUrl}/exercises`;
  private submissionUrl = `${environment.apiUrl}/submissions`; // ← Ruta correcta

  constructor(private http: HttpClient) {}

  // ========================================
  // EJERCICIOS
  // ========================================

  /**
   * Crear ejercicio (Profesor)
   */
  createExercise(exercise: Exercise, courseId: number, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exercise.title);
    formData.append('description', exercise.description);
    formData.append('difficulty', exercise.difficulty);
    formData.append('courseId', courseId.toString());

    if (exercise.deadline) {
      formData.append('deadline', exercise.deadline);
    }

    if (file) {
      formData.append('file', file, file.name);
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
   * Obtener ejercicio por ID
   */
  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar ejercicio (Profesor)
   */
  updateExercise(id: number, exercise: Exercise, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exercise.title);
    formData.append('description', exercise.description);
    formData.append('difficulty', exercise.difficulty);

    if (exercise.deadline) {
      formData.append('deadline', exercise.deadline);
    }

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Eliminar ejercicio (Profesor)
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

  // ========================================
  // PISTAS
  // ========================================

  /**
   * Crear pista (Profesor)
   */
  createHint(hint: Hint, exerciseId: number): Observable<Hint> {
    return this.http.post<Hint>(`${environment.apiUrl}/hints`, hint, {
      params: { exerciseId: exerciseId.toString() }
    });
  }

  /**
   * Obtener pistas de un ejercicio
   */
  getHintsByExercise(exerciseId: number): Observable<Hint[]> {
    return this.http.get<Hint[]>(`${environment.apiUrl}/hints/exercise/${exerciseId}`);
  }

  /**
   * Actualizar pista (Profesor)
   */
  updateHint(id: number, hint: Hint): Observable<Hint> {
    return this.http.put<Hint>(`${environment.apiUrl}/hints/${id}`, hint);
  }

  /**
   * Eliminar pista (Profesor)
   */
  deleteHint(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/hints/${id}`);
  }

  // ========================================
  // ENTREGAS (SUBMISSIONS)
  // 🔥 CORREGIDO: Usar /api/submissions según el controlador
  // ========================================

  /**
   * Subir entrega (Estudiante)
   */
  submitExercise(exerciseId: number, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('exerciseId', exerciseId.toString());
    formData.append('file', file, file.name);

    console.log('📤 Enviando entrega a:', this.submissionUrl);
    console.log('   Exercise ID:', exerciseId);
    console.log('   File:', file.name);

    return this.http.post<Submission>(this.submissionUrl, formData);
  }

  /**
   * Editar entrega (Estudiante)
   */
  updateSubmission(submissionId: number, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    console.log('✏️ Actualizando entrega:', submissionId);

    return this.http.put<Submission>(`${this.submissionUrl}/${submissionId}`, formData);
  }

  /**
   * Publicar/Despublicar entrega (Estudiante)
   */
  togglePublishSubmission(submissionId: number): Observable<Submission> {
    console.log('📤 Cambiando estado de publicación:', submissionId);

    return this.http.patch<Submission>(
      `${this.submissionUrl}/${submissionId}/publish`,
      {}
    );
  }

  /**
   * Obtener entregas de un ejercicio (Profesor)
   */
  getSubmissionsByExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionUrl}/exercise/${exerciseId}`);
  }

  /**
   * Obtener mis entregas (Estudiante)
   */
  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionUrl}/my-submissions`);
  }

  /**
   * Obtener una entrega específica
   */
  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.submissionUrl}/${id}`);
  }

  /**
   * Calificar entrega (Profesor)
   */
  gradeSubmission(id: number, grade: number, feedback: string): Observable<Submission> {
    return this.http.put<Submission>(`${this.submissionUrl}/${id}/grade`, {
      grade,
      feedback
    });
  }

  /**
   * Descargar archivo de entrega
   */
  downloadSubmission(id: number): Observable<Blob> {
    return this.http.get(`${this.submissionUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Eliminar entrega (Estudiante, antes de calificar)
   */
  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(`${this.submissionUrl}/${id}`);
  }
}