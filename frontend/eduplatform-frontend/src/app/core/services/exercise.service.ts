// frontend/eduplatform-frontend/src/app/services/exercise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Exercise {
  id?: number;
  title: string;
  description: string;
  difficulty: string;
  points?: number; // Mantenemos para compatibilidad pero no se usa
  fileName?: string;
  fileType?: string;
  deadline?: string | Date;
  createdAt?: Date;
  courseId?: number;
  hasFile?: boolean;
  hints?: Hint[];
}

export interface Hint {
  id?: number;
  content: string;
  order: number;
  cost?: number; // Mantenemos para compatibilidad pero no se usa
  exerciseId?: number;
  createdAt?: Date;
}

export interface Submission {
  id?: number;
  exerciseId?: number;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  fileName?: string;
  fileType?: string;
  submittedAt?: Date;
  status?: string;
  grade?: number; // Ahora en escala 0.0-5.0
  feedback?: string;
  gradedAt?: Date;
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
  private apiUrl = 'http://localhost:8080/api/exercises';
  private hintsUrl = 'http://localhost:8080/api/hints';
  private submissionsUrl = 'http://localhost:8080/api/submissions';

  constructor(private http: HttpClient) {}

  // ========== EXERCISES ==========

  createExercise(exercise: Exercise, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exercise.title);
    formData.append('description', exercise.description);
    formData.append('difficulty', exercise.difficulty);
    formData.append('points', '0'); // Valor por defecto, ya no se usa
    formData.append('courseId', exercise.courseId?.toString() || '');

    if (exercise.deadline) {
      formData.append('deadline', exercise.deadline.toString());
    }

    if (file) {
      formData.append('file', file);
    }

    return this.http.post<Exercise>(this.apiUrl, formData);
  }

  getExercisesByCourse(courseId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/course/${courseId}`);
  }

  getExerciseById(id: number): Observable<Exercise> {
    return this.http.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  updateExercise(id: number, exercise: Exercise, file?: File): Observable<Exercise> {
    const formData = new FormData();
    formData.append('title', exercise.title);
    formData.append('description', exercise.description);
    formData.append('difficulty', exercise.difficulty);
    formData.append('points', '0');

    if (exercise.deadline) {
      formData.append('deadline', exercise.deadline.toString());
    }

    if (file) {
      formData.append('file', file);
    }

    return this.http.put<Exercise>(`${this.apiUrl}/${id}`, formData);
  }

  deleteExercise(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  downloadExercise(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  // ========== HINTS ==========

  createHint(hint: Hint, exerciseId: number): Observable<Hint> {
    return this.http.post<Hint>(`${this.hintsUrl}?exerciseId=${exerciseId}`, hint);
  }

  getHintsByExercise(exerciseId: number): Observable<Hint[]> {
    return this.http.get<Hint[]>(`${this.hintsUrl}/exercise/${exerciseId}`);
  }

  updateHint(id: number, hint: Hint): Observable<Hint> {
    return this.http.put<Hint>(`${this.hintsUrl}/${id}`, hint);
  }

  deleteHint(id: number): Observable<any> {
    return this.http.delete(`${this.hintsUrl}/${id}`);
  }

    // ==================== ENTREGAS (ESTUDIANTE) ====================
  
  /**
   * Subir nueva entrega
   */
  submitExercise(exerciseId: number, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('exerciseId', exerciseId.toString());
    formData.append('file', file);

    return this.http.post<Submission>(`${this.apiUrl}/submissions`, formData);
  }

  /**
   * 🆕 Editar entrega existente
   */
  updateSubmission(submissionId: number, file: File): Observable<Submission> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put<Submission>(`${this.apiUrl}/submissions/${submissionId}`, formData);
  }

  /**
   * 🆕 Publicar/Despublicar entrega
   */
  togglePublishSubmission(submissionId: number): Observable<Submission> {
    return this.http.patch<Submission>(
      `${this.apiUrl}/submissions/${submissionId}/publish`,
      {}
    );
  }

  getSubmissionsByExercise(exerciseId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionsUrl}/exercise/${exerciseId}`);
  }

  getMySubmissions(): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.submissionsUrl}/my-submissions`);
  }

  getSubmissionById(id: number): Observable<Submission> {
    return this.http.get<Submission>(`${this.submissionsUrl}/${id}`);
  }

  // Calificación ahora en escala 0.0-5.0
  gradeSubmission(id: number, grade: number, feedback: string): Observable<Submission> {
    return this.http.put<Submission>(`${this.submissionsUrl}/${id}/grade`, {
      grade,
      feedback
    });
  }

  downloadSubmission(id: number): Observable<Blob> {
    return this.http.get(`${this.submissionsUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  deleteSubmission(id: number): Observable<any> {
    return this.http.delete(`${this.submissionsUrl}/${id}`);
  }
}