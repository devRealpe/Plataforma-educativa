import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  totalExercises: number;
  totalChallenges: number;
  pendingSubmissions: number;
  pendingChallengeReviews: number;
}

export interface StudentStats {
  enrolledCourses: number;
  totalXP: number;
  completedExercises: number;
  completedChallenges: number;
}

export interface CourseProgress {
  courseId: number;
  courseTitle: string;
  totalExercises: number;
  totalChallenges: number;
  totalActivities: number;
  completedExercises: number;
  completedChallenges: number;
  completedActivities: number;
  progressPercentage: number;
  earnedXP: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8080/api/stats';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las estadísticas del profesor
   */
  getTeacherStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${this.apiUrl}/teacher`);
  }

  /**
   * Obtiene las estadísticas del estudiante
   */
  getStudentStats(): Observable<StudentStats> {
    return this.http.get<StudentStats>(`${this.apiUrl}/student`);
  }

  /**
   * Obtiene el progreso de un estudiante en un curso específico
   */
  getCourseProgress(courseId: number): Observable<CourseProgress> {
    return this.http.get<CourseProgress>(`${this.apiUrl}/course/${courseId}/progress`);
  }
}