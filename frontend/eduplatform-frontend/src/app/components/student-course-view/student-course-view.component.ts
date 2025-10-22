import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../services/course.service';
import { ExerciseService, Exercise, Hint, Submission } from '../../services/exercise.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-student-course-view',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  template: `
    <div class="course-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver
          </button>

          <div class="course-info" *ngIf="course">
            <h1 class="course-title">{{ course.title }}</h1>
            <p class="course-description">{{ course.description }}</p>
            <div class="course-meta">
              <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
                {{ course.level }}
              </span>
              <span class="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profesor: {{ course.teacherName }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Loading -->
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Cargando ejercicios...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && exercises.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h3 class="empty-title">No hay ejercicios disponibles</h3>
          <p class="empty-description">El profesor aún no ha agregado ejercicios a este curso</p>
        </div>

        <!-- Exercises Grid -->
        <div *ngIf="!isLoading && exercises.length > 0" class="exercises-grid">
          <div *ngFor="let exercise of exercises" class="exercise-card" [class.completed]="hasSubmission(exercise)">
            <!-- Status Badge -->
            <div class="status-badge" *ngIf="hasSubmission(exercise)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ getSubmissionStatusText(exercise) }}
            </div>

            <!-- Card Header -->
            <div class="card-header">
              <h3 class="exercise-title">{{ exercise.title }}</h3>
              <div class="exercise-badges">
                <span class="badge difficulty" [style.background-color]="getDifficultyColor(exercise.difficulty)">
                  {{ exercise.difficulty }}
                </span>
                <span class="badge points">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ exercise.points }} XP
                </span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <p class="exercise-description">{{ exercise.description }}</p>

              <div class="exercise-info">
                <div class="info-item" *ngIf="exercise.deadline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Fecha límite: {{ exercise.deadline | date:'short' }}</span>
                </div>
                <div class="info-item" *ngIf="exercise.fileName">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span>{{ exercise.fileName }}</span>
                </div>
              </div>

              <!-- Hints Section -->
              <div class="hints-section" *ngIf="showHints[exercise.id!] && getHints(exercise).length > 0">
                <h4 class="hints-title">💡 Pistas Disponibles</h4>
                <div *ngFor="let hint of getHints(exercise)" class="hint-card">
                  <div class="hint-header">
                    <span class="hint-order">Pista {{ hint.order }}</span>
                    <span class="hint-cost">-{{ hint.cost }} XP</span>
                  </div>
                  <p class="hint-content">{{ hint.content }}</p>
                </div>
              </div>

              <!-- Submission Info -->
              <div class="submission-info" *ngIf="hasSubmission(exercise)">
                <div class="submission-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Ejercicio entregado</span>
                </div>
                <div class="submission-details" *ngIf="getSubmission(exercise) as submission">
                  <p><strong>Fecha de entrega:</strong> {{ submission.submittedAt | date:'short' }}</p>
                  <p *ngIf="submission.status === 'GRADED'">
                    <strong>Calificación:</strong> 
                    <span class="grade-value" [class.high]="submission.grade! >= 70" [class.low]="submission.grade! < 70">
                      {{ submission.grade }}/100
                    </span>
                  </p>
                  <div *ngIf="submission.feedback" class="feedback-box">
                    <strong>Retroalimentación:</strong>
                    <p>{{ submission.feedback }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="card-footer">
              <button 
                class="footer-btn" 
                (click)="downloadExercise(exercise)"
                *ngIf="exercise.fileName">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar Ejercicio
              </button>
              
              <button 
                class="footer-btn hints-btn" 
                (click)="toggleHints(exercise.id!)"
                *ngIf="getHints(exercise).length > 0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                {{ showHints[exercise.id!] ? 'Ocultar' : 'Ver' }} Pistas
              </button>

              <button 
                class="footer-btn primary"
                (click)="openUploadModal(exercise)"
                [disabled]="hasSubmission(exercise)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                {{ hasSubmission(exercise) ? 'Ya Entregado' : 'Subir Entrega' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Upload Modal -->
    <div *ngIf="showUploadModal" class="modal-overlay" (click)="closeUploadModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Subir Entrega</h3>
          <button class="close-btn" (click)="closeUploadModal()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p class="modal-description">
            Selecciona el archivo con tu solución del ejercicio: <strong>{{ selectedExercise?.title }}</strong>
          </p>
          
          <div class="file-upload-area" *ngIf="!selectedFile">
            <input
              type="file"
              id="submission-file"
              class="file-input"
              (change)="onFileSelected($event)"
              accept=".pdf,.zip,.rar,.txt,.doc,.docx,.java,.py,.cpp,.c,.js,.ts"
            />
            <label for="submission-file" class="file-label">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Haz clic para seleccionar archivo</span>
              <span class="file-hint">PDF, ZIP, código fuente (máx. 10MB)</span>
            </label>
          </div>

          <div class="file-selected" *ngIf="selectedFile">
            <div class="file-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                <polyline points="13 2 13 9 20 9"/>
              </svg>
              <span>{{ selectedFile.name }}</span>
            </div>
            <button type="button" class="remove-file-btn" (click)="removeFile()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="closeUploadModal()">Cancelar</button>
          <button 
            class="btn-submit" 
            (click)="submitExercise()"
            [disabled]="!selectedFile || isSubmitting">
            {{ isSubmitting ? 'Subiendo...' : 'Subir Entrega' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./student-course-view.component.scss']
})
export class StudentCourseViewComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  submissions: Submission[] = [];
  exerciseHints: { [key: number]: Hint[] } = {};
  
  isLoading = true;
  showHints: { [key: number]: boolean } = {};
  
  // Upload modal
  showUploadModal = false;
  selectedExercise: Exercise | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseData();
  }

  loadCourseData() {
    this.isLoading = true;
    
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        this.course = courses.find(c => c.id === this.courseId) || null;
        
        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/student-dashboard']);
          return;
        }
        
        this.loadExercises();
        this.loadMySubmissions();
      },
      error: (error) => {
        console.error('❌ Error al cargar curso:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar el curso', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadExercises() {
    this.exerciseService.getExercisesByCourse(this.courseId).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.isLoading = false;
        
        // Cargar pistas para cada ejercicio
        exercises.forEach(exercise => {
          if (exercise.id) {
            this.loadHints(exercise.id);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadHints(exerciseId: number) {
    this.exerciseService.getHintsByExercise(exerciseId).subscribe({
      next: (hints) => {
        this.exerciseHints[exerciseId] = hints;
      },
      error: (error) => {
        console.error('❌ Error al cargar pistas:', error);
      }
    });
  }

  loadMySubmissions() {
    this.exerciseService.getMySubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
      },
      error: (error) => {
        console.error('❌ Error al cargar entregas:', error);
      }
    });
  }

  getHints(exercise: Exercise): Hint[] {
    return exercise.id ? (this.exerciseHints[exercise.id] || []) : [];
  }

  toggleHints(exerciseId: number) {
    this.showHints[exerciseId] = !this.showHints[exerciseId];
  }

  downloadExercise(exercise: Exercise) {
    if (!exercise.id) return;

    this.exerciseService.downloadExercise(exercise.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exercise.fileName || 'ejercicio.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('✅ Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openUploadModal(exercise: Exercise) {
    this.selectedExercise = exercise;
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedExercise = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  submitExercise() {
    if (!this.selectedFile || !this.selectedExercise?.id || this.isSubmitting) return;

    this.isSubmitting = true;

    this.exerciseService.submitExercise(this.selectedExercise.id, this.selectedFile).subscribe({
      next: (submission) => {
        this.submissions.push(submission);
        this.snackBar.open('✅ Entrega subida exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeUploadModal();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Error al subir entrega:', error);
        this.snackBar.open(
          error.error?.error || 'Error al subir entrega',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSubmitting = false;
      }
    });
  }

  hasSubmission(exercise: Exercise): boolean {
    return this.submissions.some(s => s.exerciseId === exercise.id);
  }

  getSubmission(exercise: Exercise): Submission | undefined {
    return this.submissions.find(s => s.exerciseId === exercise.id);
  }

  getSubmissionStatusText(exercise: Exercise): string {
    const submission = this.getSubmission(exercise);
    if (!submission) return 'Pendiente';
    if (submission.status === 'GRADED') return 'Calificado';
    return 'Entregado';
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Principiante': '#10b981',
      'Intermedio': '#f59e0b',
      'Avanzado': '#ef4444',
      'Experto': '#8b5cf6'
    };
    return colors[difficulty] || '#6b7280';
  }

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }
}