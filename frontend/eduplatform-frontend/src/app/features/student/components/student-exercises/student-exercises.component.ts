import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExerciseService, Exercise, Hint, Submission } from '../../../../core/services/exercise.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-student-exercises',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: './student-exercises.component.html',
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
