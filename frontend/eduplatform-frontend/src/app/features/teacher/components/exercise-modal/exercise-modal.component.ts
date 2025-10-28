import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Exercise } from '../../../../core/services/exercise.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exercise-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exercise-modal.component.html',
  styleUrls: ['./exercise-modal.component.scss']
})
export class ExerciseModalComponent implements OnInit {
  @Input() courseId!: number;
  @Input() editingExercise: Exercise | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() exerciseCreated = new EventEmitter<Exercise>();

  isSubmitting = false;
  selectedFile: File | null = null;

  exerciseForm: Exercise = {
    title: '',
    description: '',
    difficulty: '',
    deadline: ''
  };

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.editingExercise) {
      this.exerciseForm = { ...this.editingExercise };
      if (this.exerciseForm.deadline) {
        const date = new Date(this.exerciseForm.deadline);
        this.exerciseForm.deadline = date.toISOString().slice(0, 16);
      }
    }
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
    if (this.editingExercise) {
      this.editingExercise.fileName = undefined;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.exerciseForm.title &&
      this.exerciseForm.description &&
      this.exerciseForm.difficulty
    );
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.exerciseForm.courseId = this.courseId;

    const request$ = this.editingExercise?.id
      ? this.exerciseService.updateExercise(this.editingExercise.id, this.exerciseForm, this.selectedFile || undefined)
      : this.exerciseService.createExercise(this.exerciseForm, this.selectedFile || undefined);

    request$.subscribe({
      next: (exercise) => {
        this.snackBar.open(this.editingExercise ? '✅ Ejercicio actualizado' : '✅ Ejercicio creado', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.exerciseCreated.emit(exercise);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.snackBar.open('Error al guardar el ejercicio', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}