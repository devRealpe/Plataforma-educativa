import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Submission } from '../../services/exercise.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-submissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">📋 Entregas del Ejercicio</h2>
              <p class="modal-subtitle">{{ exerciseTitle }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- Stats -->
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ submissions.length }}</span>
              <span class="stat-label">Total Entregas</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getPendingCount() }}</span>
              <span class="stat-label">Pendientes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getGradedCount() }}</span>
              <span class="stat-label">Calificadas</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ getAverageGrade() }}</span>
              <span class="stat-label">Promedio</span>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Cargando entregas...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && submissions.length === 0" class="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h3>No hay entregas todavía</h3>
            <p>Los estudiantes aún no han subido sus soluciones para este ejercicio</p>
          </div>

          <!-- Submissions List -->
          <div *ngIf="!isLoading && submissions.length > 0" class="submissions-list">
            <div *ngFor="let submission of submissions" class="submission-card">
              <!-- Student Info -->
              <div class="submission-header">
                <div class="student-info">
                  <div class="student-avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="student-name">{{ submission.studentName }}</h4>
                    <p class="student-email">{{ submission.studentEmail }}</p>
                  </div>
                </div>
                <div class="submission-status" [ngClass]="submission.status">
                  {{ getStatusText(submission.status) }}
                </div>
              </div>

              <!-- Submission Details -->
              <div class="submission-details">
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{{ submission.submittedAt | date:'short' }}</span>
                </div>
                <div class="detail-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline points="13 2 13 9 20 9"/>
                  </svg>
                  <span>{{ submission.fileName }}</span>
                </div>
              </div>

              <!-- Grade Section -->
              <div class="grade-section" *ngIf="submission.status === 'GRADED'">
                <div class="grade-display">
                  <span class="grade-label">Calificación:</span>
                  <span class="grade-value" [class.high]="submission.grade! >= 70" [class.low]="submission.grade! < 70">
                    {{ submission.grade }}/100
                  </span>
                </div>
                <div class="feedback-display" *ngIf="submission.feedback">
                  <strong>Retroalimentación:</strong>
                  <p>{{ submission.feedback }}</p>
                </div>
              </div>

              <!-- Grading Form -->
              <div class="grading-form" *ngIf="gradingSubmission?.id === submission.id">
                <div class="form-group">
                  <label>Calificación (0-100)</label>
                  <input
                    type="number"
                    class="grade-input"
                    [(ngModel)]="gradeForm.grade"
                    min="0"
                    max="100"
                    placeholder="85"
                  />
                </div>
                <div class="form-group">
                  <label>Retroalimentación</label>
                  <textarea
                    class="feedback-textarea"
                    [(ngModel)]="gradeForm.feedback"
                    placeholder="Escribe tu retroalimentación para el estudiante..."
                    rows="4"
                  ></textarea>
                </div>
                <div class="form-actions">
                  <button class="btn-cancel" (click)="cancelGrading()">Cancelar</button>
                  <button class="btn-submit" (click)="submitGrade()" [disabled]="!isGradeValid()">
                    Guardar Calificación
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="submission-actions" *ngIf="gradingSubmission?.id !== submission.id">
                <button class="action-btn download" (click)="downloadSubmission(submission)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar
                </button>
                <button class="action-btn grade" (click)="startGrading(submission)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  {{ submission.status === 'GRADED' ? 'Editar Calificación' : 'Calificar' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    $primary-blue: #2563eb;
    $success-green: #10b981;
    $warning-orange: #f59e0b;
    $danger-red: #dc2626;
    $gray-50: #f9fafb;
    $gray-100: #f3f4f6;
    $gray-200: #e5e7eb;
    $gray-300: #d1d5db;
    $gray-600: #6b7280;
    $gray-700: #374151;
    $gray-900: #111827;

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid $gray-200;
      background: linear-gradient(135deg, $primary-blue 0%, #8b5cf6 100%);
      border-radius: 16px 16px 0 0;
      color: white;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.25rem 0;
    }

    .modal-subtitle {
      font-size: 0.875rem;
      opacity: 0.9;
      margin: 0;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: none;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }
    }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 2rem;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: $gray-100;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb {
        background: $gray-300;
        border-radius: 10px;

        &:hover {
          background: $gray-600;
        }
      }
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      background: linear-gradient(135deg, $gray-50 0%, white 100%);
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid $gray-200;
      text-align: center;

      .stat-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
        color: $primary-blue;
        margin-bottom: 0.25rem;
      }

      .stat-label {
        display: block;
        font-size: 0.75rem;
        color: $gray-600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid $gray-200;
      border-top-color: $primary-blue;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      svg {
        color: $gray-300;
        margin-bottom: 1.5rem;
      }

      h3 {
        font-size: 1.25rem;
        color: $gray-700;
        margin: 0 0 0.5rem 0;
      }

      p {
        color: $gray-600;
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .submissions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .submission-card {
      background: $gray-50;
      border: 1px solid $gray-200;
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    .submission-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .student-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .student-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, $primary-blue 0%, #8b5cf6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .student-name {
      font-size: 1rem;
      font-weight: 600;
      color: $gray-900;
      margin: 0 0 0.25rem 0;
    }

    .student-email {
      font-size: 0.875rem;
      color: $gray-600;
      margin: 0;
    }

    .submission-status {
      padding: 0.375rem 0.875rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;

      &.PENDING {
        background: #fef3c7;
        color: #92400e;
      }

      &.GRADED {
        background: #d1fae5;
        color: #065f46;
      }
    }

    .submission-details {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: $gray-700;

      svg {
        color: $primary-blue;
        flex-shrink: 0;
      }
    }

    .grade-section {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .grade-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;

      .grade-label {
        font-weight: 600;
        color: #065f46;
      }

      .grade-value {
        font-size: 1.5rem;
        font-weight: 700;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        background: white;

        &.high {
          color: $success-green;
        }

        &.low {
          color: $warning-orange;
        }
      }
    }

    .feedback-display {
      background: white;
      padding: 0.75rem;
      border-radius: 6px;

      strong {
        display: block;
        color: #065f46;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }

      p {
        margin: 0;
        color: $gray-700;
        font-size: 0.875rem;
        line-height: 1.5;
      }
    }

    .grading-form {
      background: white;
      padding: 1.5rem;
      border-radius: 10px;
      border: 2px solid $primary-blue;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-weight: 600;
        color: $gray-700;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
      }
    }

    .grade-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid $gray-200;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      color: $gray-900;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: $primary-blue;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      }
    }

    .feedback-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid $gray-200;
      border-radius: 8px;
      font-size: 0.875rem;
      color: $gray-900;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: $primary-blue;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      }
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .btn-cancel, .btn-submit {
      flex: 1;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .btn-cancel {
      background: $gray-100;
      color: $gray-700;

      &:hover {
        background: $gray-200;
      }
    }

    .btn-submit {
      background: $primary-blue;
      color: white;

      &:hover:not(:disabled) {
        background: #1d4ed8;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .submission-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;

      &.download {
        background: white;
        color: $gray-700;
        border: 2px solid $gray-200;

        &:hover {
          background: $gray-50;
          border-color: $gray-300;
        }
      }

      &.grade {
        background: $primary-blue;
        color: white;

        &:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
      }
    }

    @media (max-width: 640px) {
      .modal-container {
        max-height: 95vh;
      }

      .modal-header {
        padding: 1.25rem 1.5rem;
      }

      .header-content {
        flex-direction: column;
        gap: 0.75rem;
      }

      .modal-content {
        padding: 1.25rem 1.5rem;
      }

      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }

      .submission-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .submission-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SubmissionsModalComponent implements OnInit {
  @Input() exerciseId!: number;
  @Input() exerciseTitle: string = '';
  @Output() closeModal = new EventEmitter<void>();

  submissions: Submission[] = [];
  isLoading = true;
  gradingSubmission: Submission | null = null;
  
  gradeForm = {
    grade: 0,
    feedback: ''
  };

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.isLoading = true;
    this.exerciseService.getSubmissionsByExercise(this.exerciseId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar entregas:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar entregas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getPendingCount(): number {
    return this.submissions.filter(s => s.status === 'PENDING').length;
  }

  getGradedCount(): number {
    return this.submissions.filter(s => s.status === 'GRADED').length;
  }

  getAverageGrade(): string {
    const graded = this.submissions.filter(s => s.status === 'GRADED' && s.grade !== undefined);
    if (graded.length === 0) return '-';
    const sum = graded.reduce((acc, s) => acc + (s.grade || 0), 0);
    return (sum / graded.length).toFixed(1);
  }

  getStatusText(status: string | undefined): string {
    if (status === 'PENDING') return 'Pendiente';
    if (status === 'GRADED') return 'Calificado';
    return 'Desconocido';
  }

  startGrading(submission: Submission) {
    this.gradingSubmission = submission;
    this.gradeForm.grade = submission.grade || 0;
    this.gradeForm.feedback = submission.feedback || '';
  }

  cancelGrading() {
    this.gradingSubmission = null;
    this.gradeForm = { grade: 0, feedback: '' };
  }

  isGradeValid(): boolean {
    return this.gradeForm.grade >= 0 && this.gradeForm.grade <= 100;
  }

  submitGrade() {
    if (!this.gradingSubmission?.id || !this.isGradeValid()) return;

    this.exerciseService.gradeSubmission(
      this.gradingSubmission.id,
      this.gradeForm.grade,
      this.gradeForm.feedback
    ).subscribe({
      next: (updatedSubmission) => {
        const index = this.submissions.findIndex(s => s.id === updatedSubmission.id);
        if (index !== -1) {
          this.submissions[index] = updatedSubmission;
        }
        
        this.snackBar.open('✅ Calificación guardada exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.cancelGrading();
      },
      error: (error) => {
        console.error('❌ Error al calificar:', error);
        this.snackBar.open('Error al guardar calificación', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  downloadSubmission(submission: Submission) {
    if (!submission.id) return;

    this.exerciseService.downloadSubmission(submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'entrega.zip';
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

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.close();
    }
  }
}