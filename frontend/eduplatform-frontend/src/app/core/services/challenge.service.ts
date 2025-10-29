import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// ========================================
// INTERFACES
// ========================================

export interface Challenge {
  id?: number;
  title: string;
  description: string;
  difficulty: string; // BASICO, INTERMEDIO, AVANZADO
  maxBonusPoints: number; // 1-10 XP
  fileName?: string;
  fileType?: string;
  deadline?: string;
  createdAt?: string;
  active?: boolean;
  courseId?: number;
  hasFile?: boolean;
  submissionsCount?: number;
}

export interface ChallengeSubmission {
  id?: number;
  challengeId?: number;
  challengeTitle?: string;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  fileName?: string;
  fileType?: string;
  submittedAt?: string;
  status?: string; // 'PENDING' | 'REVIEWED' | 'REJECTED'
  bonusPoints?: number;
  feedback?: string;
  reviewedAt?: string;
  hasFile?: boolean;
  lastModifiedAt?: string;
  editCount?: number;
  canBeEdited?: boolean;
  daysUntilDeadline?: number;
  challengeDeadline?: string;
}

export interface PodiumEntry {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalBonusPoints: number;
  challengesCompleted: number;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private apiUrl = `${environment.apiUrl}/challenges`;
  private submissionUrl = `${environment.apiUrl}/challenge-submissions`;
  private podiumUrl = `${environment.apiUrl}/podium`;

  constructor(private http: HttpClient) {}

  // ========================================
  // RETOS (CHALLENGES)
  // ========================================

  /**
   * Crear reto (Profesor)
   */
  createChallenge(challenge: Challenge, courseId: number, file?: File): Observable<Challenge> {
    const formData = new FormData();
    formData.append('title', challenge.title);
    formData.append('description', challenge.description);
    formData.append('difficulty', challenge.difficulty);
    formData.append('maxBonusPoints', challenge.maxBonusPoints.toString());
    formData.append('courseId', courseId.toString());

    if (challenge.deadline) {
      formData.append('deadline', challenge.deadline);
    }

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.post<Challenge>(this.apiUrl, formData);
  }

  /**
   * Obtener retos de un curso
   */
  getChallengesByCourse(courseId: number): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /**
   * Obtener reto por ID
   */
  getChallengeById(id: number): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualizar reto (Profesor)
   */
  updateChallenge(id: number, challenge: Challenge, file?: File): Observable<Challenge> {
    const formData = new FormData();
    formData.append('title', challenge.title);
    formData.append('description', challenge.description);
    formData.append('difficulty', challenge.difficulty);
    formData.append('maxBonusPoints', challenge.maxBonusPoints.toString());

    if (challenge.deadline) {
      formData.append('deadline', challenge.deadline);
    }

    if (challenge.active !== undefined) {
      formData.append('active', challenge.active.toString());
    }

    if (file) {
      formData.append('file', file, file.name);
    }

    return this.http.put<Challenge>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Eliminar reto (Profesor)
   */
  deleteChallenge(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Descargar archivo del reto
   */
  downloadChallenge(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  // ========================================
  // ENTREGAS DE RETOS (CHALLENGE SUBMISSIONS)
  // ========================================

  /**
   * Subir solución de reto (Estudiante)
   */
  submitChallenge(challengeId: number, file: File): Observable<ChallengeSubmission> {
    const formData = new FormData();
    formData.append('challengeId', challengeId.toString());
    formData.append('file', file, file.name);

    console.log('📤 Enviando solución de reto a:', this.submissionUrl);
    console.log('   Challenge ID:', challengeId);
    console.log('   File:', file.name);

    return this.http.post<ChallengeSubmission>(this.submissionUrl, formData);
  }

  /**
   * Editar solución (Estudiante)
   */
  updateChallengeSubmission(submissionId: number, file: File): Observable<ChallengeSubmission> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    console.log('✏️ Actualizando solución de reto:', submissionId);

    return this.http.put<ChallengeSubmission>(`${this.submissionUrl}/${submissionId}`, formData);
  }

  /**
   * Obtener soluciones de un reto (Profesor)
   */
  getSubmissionsByChallenge(challengeId: number): Observable<ChallengeSubmission[]> {
    return this.http.get<ChallengeSubmission[]>(`${this.submissionUrl}/challenge/${challengeId}`);
  }

  /**
   * Obtener mis soluciones (Estudiante)
   */
  getMyChallengeSubmissions(): Observable<ChallengeSubmission[]> {
    return this.http.get<ChallengeSubmission[]>(`${this.submissionUrl}/my-submissions`);
  }

  /**
   * Obtener una solución específica
   */
  getChallengeSubmissionById(id: number): Observable<ChallengeSubmission> {
    return this.http.get<ChallengeSubmission>(`${this.submissionUrl}/${id}`);
  }

  /**
   * Revisar y otorgar bonificación (Profesor)
   */
  reviewChallengeSubmission(id: number, bonusPoints: number, feedback: string): Observable<ChallengeSubmission> {
    return this.http.put<ChallengeSubmission>(`${this.submissionUrl}/${id}/review`, {
      bonusPoints,
      feedback
    });
  }

  /**
   * Descargar archivo de solución
   */
  downloadChallengeSubmission(id: number): Observable<Blob> {
    return this.http.get(`${this.submissionUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Eliminar solución (Estudiante, antes de revisar)
   */
  deleteChallengeSubmission(id: number): Observable<any> {
    return this.http.delete(`${this.submissionUrl}/${id}`);
  }

  // ========================================
  // PODIO
  // ========================================

  /**
   * Obtener podio de un curso específico
   */
  getPodiumByCourse(courseId: number): Observable<PodiumEntry[]> {
    return this.http.get<PodiumEntry[]>(`${this.podiumUrl}/course/${courseId}`);
  }

  /**
   * Obtener podio por nivel de curso
   */
  getPodiumByLevel(level: string): Observable<PodiumEntry[]> {
    return this.http.get<PodiumEntry[]>(`${this.podiumUrl}/level/${level}`);
  }

  /**
   * Obtener mi posición en el podio
   */
  getMyPosition(courseId: number): Observable<PodiumEntry> {
    return this.http.get<PodiumEntry>(`${this.podiumUrl}/my-position/${courseId}`);
  }
}