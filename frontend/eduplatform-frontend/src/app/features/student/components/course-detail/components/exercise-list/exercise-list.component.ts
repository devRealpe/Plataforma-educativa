import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise, Submission } from '../../../../../../core/services/exercise.service';
import { ExerciseService } from '../../../../../../core/services/exercise.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent implements OnInit {
  @Input() exercises: Exercise[] = [];
  @Input() submissions: Submission[] = [];
  @Input() isLoading = false;

  @Output() uploadExercise = new EventEmitter<Exercise>();
  @Output() editSubmission = new EventEmitter<{ exercise: Exercise; submission: Submission }>();
  @Output() deleteSubmission = new EventEmitter<Exercise>();
  @Output() downloadExercise = new EventEmitter<Exercise>();
  @Output() downloadSubmission = new EventEmitter<Submission>();
  @Output() openExternalUrl = new EventEmitter<string>();
  @Output() viewHints = new EventEmitter<Exercise>();

  // 🆕 Mapa para rastrear qué ejercicios tienen pistas
  exercisesWithHints = new Map<number, boolean>();
  loadingHints = new Set<number>();

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit() {
    // Cargar información de pistas para cada ejercicio
    this.checkHintsAvailability();
  }

  /**
   * 🔍 Verificar qué ejercicios tienen pistas disponibles
   */
  checkHintsAvailability() {
    this.exercises.forEach(exercise => {
      if (exercise.id) {
        this.loadingHints.add(exercise.id);
        
        this.exerciseService.getHintsByExercise(exercise.id).subscribe({
          next: (hints) => {
            // Guardar si tiene pistas o no
            this.exercisesWithHints.set(exercise.id!, hints.length > 0);
            this.loadingHints.delete(exercise.id!);
          },
          error: (error) => {
            console.error(`Error al verificar pistas para ejercicio ${exercise.id}:`, error);
            // En caso de error, asumimos que no hay pistas
            this.exercisesWithHints.set(exercise.id!, false);
            this.loadingHints.delete(exercise.id!);
          }
        });
      }
    });
  }

  /**
   * 🔍 Verificar si un ejercicio tiene pistas disponibles
   */
  hasHints(exercise: Exercise): boolean {
    if (!exercise.id) return false;
    return this.exercisesWithHints.get(exercise.id) ?? false;
  }

  /**
   * 🔍 Verificar si se están cargando las pistas de un ejercicio
   */
  isLoadingHints(exercise: Exercise): boolean {
    if (!exercise.id) return false;
    return this.loadingHints.has(exercise.id);
  }

  getSubmission(exercise: Exercise): Submission | undefined {
    return this.submissions.find(s => s.exerciseId === exercise.id);
  }

  hasSubmission(exercise: Exercise): boolean {
    return !!this.getSubmission(exercise);
  }

  getSubmissionStatusText(exercise: Exercise): string {
    const submission = this.getSubmission(exercise);
    if (!submission) return 'Sin entregar';
    if (submission.status === 'GRADED') return '✅ Calificado';
    return '📤 Entregado';
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

  getDaysUntilDeadline(exercise: Exercise): number | null {
    if (!exercise.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(exercise.deadline);
    
    if (now > deadline) return 0;
    
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDeadlineMessage(exercise: Exercise): string {
    const days = this.getDaysUntilDeadline(exercise);

    if (days === null) return '';
    if (days === 0) return '⏰ Plazo vencido';
    if (days === 1) return '⚠️ Último día';
    if (days <= 3) return `⚠️ ${days} días restantes`;
    return `${days} días restantes`;
  }

  onUploadExercise(exercise: Exercise) {
    this.uploadExercise.emit(exercise);
  }

  onEditSubmission(exercise: Exercise) {
    const submission = this.getSubmission(exercise);
    if (submission) {
      this.editSubmission.emit({ exercise, submission });
    }
  }

  onDeleteSubmission(exercise: Exercise) {
    this.deleteSubmission.emit(exercise);
  }

  onDownloadExercise(exercise: Exercise) {
    this.downloadExercise.emit(exercise);
  }

  onDownloadSubmission(exercise: Exercise) {
    const submission = this.getSubmission(exercise);
    if (submission) {
      this.downloadSubmission.emit(submission);
    }
  }

  onOpenExternalUrl(url: string) {
    this.openExternalUrl.emit(url);
  }

  onViewHints(exercise: Exercise) {
    // Solo emitir si realmente tiene pistas
    if (this.hasHints(exercise)) {
      this.viewHints.emit(exercise);
    }
  }
}