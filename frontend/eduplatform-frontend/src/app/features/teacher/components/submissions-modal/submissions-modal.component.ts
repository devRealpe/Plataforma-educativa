import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Submission } from '../../../../core/services/exercise.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-submissions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './submissions-modal.component.html',
  styleUrls: ['./submissions-modal.component.scss']
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
    console.log('🔍 Cargando entregas para ejercicio:', this.exerciseId);
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.isLoading = true;
    this.exerciseService.getSubmissionsByExercise(this.exerciseId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.isLoading = false;
        console.log('✅ Entregas cargadas:', submissions);
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
    // Convertir a número y validar que esté en el rango 0.0 - 5.0
    const grade = Number(this.gradeForm.grade);
    return !isNaN(grade) && grade >= 0 && grade <= 5.0;
  }

  submitGrade() {
    if (!this.gradingSubmission?.id || !this.isGradeValid()) {
      this.snackBar.open('⚠️ La nota debe estar entre 0.0 y 5.0', 'Cerrar', { 
        duration: 3000 
      });
      return;
    }

    // Convertir a número y redondear a 1 decimal
    const gradeValue = Number(this.gradeForm.grade);
    const roundedGrade = Math.round(gradeValue * 10) / 10;

    console.log('📊 Enviando calificación:', {
      original: this.gradeForm.grade,
      converted: gradeValue,
      rounded: roundedGrade
    });

    this.exerciseService.gradeSubmission(
      this.gradingSubmission.id,
      roundedGrade,
      this.gradeForm.feedback
    ).subscribe({
      next: (updatedSubmission) => {
        const index = this.submissions.findIndex(s => s.id === updatedSubmission.id);
        if (index !== -1) {
          this.submissions[index] = updatedSubmission;
        }
        
        this.snackBar.open(`✅ Calificación guardada: ${roundedGrade}/5.0`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.cancelGrading();
      },
      error: (error) => {
        console.error('❌ Error al calificar:', error);
        console.error('Detalles del error:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
        
        let errorMessage = 'Error al guardar calificación';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(`❌ ${errorMessage}`, 'Cerrar', {
          duration: 5000,
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