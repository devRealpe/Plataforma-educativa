import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exercise } from '../../../../../../core/services/exercise.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent {
  @Input() exercises: Exercise[] = [];
  @Input() isLoading = false;

  @Output() createExercise = new EventEmitter<void>();
  @Output() editExercise = new EventEmitter<Exercise>();
  @Output() deleteExercise = new EventEmitter<Exercise>();
  @Output() manageHints = new EventEmitter<Exercise>();
  @Output() downloadExercise = new EventEmitter<Exercise>();
  @Output() viewSubmissions = new EventEmitter<Exercise>();
  @Output() openExternalUrl = new EventEmitter<string>();

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Principiante': '#10b981',
      'Intermedio': '#f59e0b',
      'Avanzado': '#ef4444',
      'Experto': '#8b5cf6',
      'BASICO': '#10b981',
      'INTERMEDIO': '#f59e0b',
      'AVANZADO': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  }

  onCreateExercise() {
    this.createExercise.emit();
  }

  onEditExercise(exercise: Exercise) {
    this.editExercise.emit(exercise);
  }

  onDeleteExercise(exercise: Exercise) {
    this.deleteExercise.emit(exercise);
  }

  onManageHints(exercise: Exercise) {
    this.manageHints.emit(exercise);
  }

  onDownloadExercise(exercise: Exercise) {
    this.downloadExercise.emit(exercise);
  }

  onViewSubmissions(exercise: Exercise) {
    this.viewSubmissions.emit(exercise);
  }

  onOpenExternalUrl(url: string) {
    this.openExternalUrl.emit(url);
  }
}