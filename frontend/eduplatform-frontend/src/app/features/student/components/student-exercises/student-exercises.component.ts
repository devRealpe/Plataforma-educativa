import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExerciseService, Exercise, Hint, Submission } from '../../../../core/services/exercise.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-student-exercises',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  template: `
    <div class="exercises-container">
      <div class="section-header">
        <h2>📚 Ejercicios del Curso</h2>
        <p class="subtitle">Descarga, completa y sube tus ejercicios</p>
      </div>

      <!-- Loading -->
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando ejercicios...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && exercises.length === 0" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <h3>No hay ejercicios disponibles</h3>
        <p>El profesor aún no ha agregado ejercicios a este curso</p>
      </div>

      <!-- Exercises List -->
      <div *ngIf="!isLoading && exercises.length > 0" class="exercises-list">
        <div *ngFor="let exercise of exercises" class="exercise-card">
          
          <!-- Header -->
          <div class="exercise-header">
            <div class="header-info">
              <h3 class="exercise-title">{{ exercise.title }}</h3>
              <div class="exercise-badges">
                <span class="badge difficulty" [style.background-color]="getDifficultyColor(exercise.difficulty)">
                  {{ exercise.difficulty }}
                </span>
                <span class="badge points">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 
                    5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {{ exercise.points }}
                </span>
                <span class="badge status" [ngClass]="getSubmissionStatus(exercise)">
                  {{ getSubmissionStatusText(exercise) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="exercise-content">
            <p class="exercise-description">{{ exercise.description }}</p>

            <!-- Info Items -->
            <div class="info-items">
              <div class="info-item" *ngIf="exercise.deadline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Fecha límite: {{ exercise.deadline | date:'short' }}</span>
              </div>
              <div class="info-item" *ngIf="exercise.hints && exercise.hints.length > 0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <span>{{ exercise.hints.length }} pista(s) disponible(s)</span>
              </div>
            </div>

            <!-- Hints Section -->
            <div *ngIf="showHints[exercise.id!] && exercise.hints && exercise.hints.length > 0" class="hints-section">
              <h4>💡 Pistas Disponibles</h4>
              <div *ngFor="let hint of exercise.hints" class="hint-card">
                <div class="hint-header">
                  <span class="hint-order">Pista {{ hint.order }}</span>
                  <span class="hint-cost">Costo: {{ hint.cost }}</span>
                </div>
                <p class="hint-content">{{ hint.content }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="exercise-actions">
            <button class="action-btn secondary" (click)="downloadExercise(exercise)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar Ejercicio
            </button>

            <button 
              *ngIf="exercise.hints && exercise.hints.length > 0"
              class="action-btn hints" 
              (click)="toggleHints(exercise.id!)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              {{ showHints[exercise.id!] ? 'Ocultar' : 'Ver' }} Pistas
            </button>

            <button 
              class="action-btn primary"
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

          <!-- Submission Status -->
          <div *ngIf="hasSubmission(exercise)" class="submission-info">
            <div class="submission-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Ejercicio entregado</span>
            </div>
            <div class="submission-details" *ngIf="getSubmission(exercise) as submission">
              <p><strong>Fecha de entrega:</strong> {{ submission.submittedAt | date:'short' }}</p>
              <p *ngIf="submission.status === 'GRADED'">
                <strong>Calificación:</strong> {{ submission.grade }}/100
              </p>
              <p *ngIf="submission.feedback" class="feedback">
                <strong>Retroalimentación:</strong> {{ submission.feedback }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./student-exercises.component.scss']
})
export class StudentExercisesComponent implements OnInit {
  @Input() courseId!: number;

  exercises: Exercise[] = [];
  submissions: Submission[] = [];
  isLoading = true;
  showHints: { [key: number]: boolean } = {};
  
  showUploadModal = false;
  selectedExercise: Exercise | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadExercises();
    this.loadMySubmissions();
  }

  loadExercises() {
    this.exerciseService.getExercisesByCourse(this.courseId).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.isLoading = false;
        exercises.forEach(ex => ex.id && this.loadHints(ex.id));
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadHints(id: number) {
    this.exerciseService.getHintsByExercise(id).subscribe({
      next: (hints) => {
        const exercise = this.exercises.find(e => e.id === id);
        if (exercise) exercise.hints = hints;
      }
    });
  }

  loadMySubmissions() {
    this.exerciseService.getMySubmissions().subscribe({
      next: (subs) => (this.submissions = subs),
      error: (e) => console.error('❌ Error al cargar entregas:', e)
    });
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
      error: (e) => {
        console.error('❌ Error al descargar:', e);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  toggleHints(id: number) {
    this.showHints[id] = !this.showHints[id];
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
    if (file && file.size <= 10 * 1024 * 1024) {
      this.selectedFile = file;
    } else {
      this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  submitExercise() {
    if (!this.selectedFile || !this.selectedExercise?.id || this.isSubmitting) return;
    this.isSubmitting = true;

    this.exerciseService.submitExercise(this.selectedExercise.id, this.selectedFile).subscribe({
      next: (sub) => {
        this.submissions.push(sub);
        this.snackBar.open('✅ Entrega subida exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.closeUploadModal();
        this.isSubmitting = false;
      },
      error: (e) => {
        console.error('❌ Error al subir entrega:', e);
        this.snackBar.open(e.error?.error || 'Error al subir entrega', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
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

  getSubmissionStatus(exercise: Exercise): string {
    const s = this.getSubmission(exercise);
    if (!s) return 'pending';
    return s.status === 'GRADED' ? 'graded' : 'submitted';
  }

  getSubmissionStatusText(exercise: Exercise): string {
    const s = this.getSubmission(exercise);
    if (!s) return 'Pendiente';
    return s.status === 'GRADED' ? 'Calificado' : 'Entregado';
  }

  getDifficultyColor(diff: string): string {
    const colors: Record<string, string> = {
      Principiante: '#10b981',
      Intermedio: '#f59e0b',
      Avanzado: '#ef4444',
      Experto: '#8b5cf6'
    };
    return colors[diff] || '#6b7280';
  }
}
