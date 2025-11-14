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
    deadline: '',
    externalUrl: '' // ✅ NUEVO campo
  };

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.editingExercise) {
      this.exerciseForm = { ...this.editingExercise };
      
      // Formatear fecha para datetime-local
      if (this.exerciseForm.deadline) {
        const date = new Date(this.exerciseForm.deadline);
        this.exerciseForm.deadline = date.toISOString().slice(0, 16);
      }

      // ✅ NUEVO: Asegurar que externalUrl tenga valor
      if (!this.exerciseForm.externalUrl) {
        this.exerciseForm.externalUrl = '';
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:', file.name);
    }
  }

  removeFile() {
    this.selectedFile = null;
    if (this.editingExercise) {
      this.editingExercise.fileName = undefined;
    }
  }

  isFormValid(): boolean {
    const hasBasicInfo = !!(
      this.exerciseForm.title &&
      this.exerciseForm.description &&
      this.exerciseForm.difficulty
    );

    // ✅ NUEVO: Validar URL si está presente
    if (this.exerciseForm.externalUrl && this.exerciseForm.externalUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(this.exerciseForm.externalUrl.trim())) {
        return false; // URL inválida
      }
    }

    return hasBasicInfo;
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.exerciseForm.courseId = this.courseId;

    // ✅ NUEVO: Limpiar URL si está vacía
    if (this.exerciseForm.externalUrl) {
      this.exerciseForm.externalUrl = this.exerciseForm.externalUrl.trim();
      if (!this.exerciseForm.externalUrl) {
        this.exerciseForm.externalUrl = undefined;
      }
    }

    console.log('📤 Enviando ejercicio:', {
      title: this.exerciseForm.title,
      hasFile: !!this.selectedFile,
      hasUrl: !!this.exerciseForm.externalUrl,
      externalUrl: this.exerciseForm.externalUrl
    });

    const request$ = this.editingExercise?.id
      ? this.exerciseService.updateExercise(
          this.editingExercise.id, 
          this.exerciseForm, 
          this.selectedFile || undefined
        )
      : this.exerciseService.createExercise(
          this.exerciseForm, 
          this.courseId, 
          this.selectedFile || undefined
        );

    request$.subscribe({
      next: (exercise) => {
        console.log('✅ Ejercicio guardado:', exercise);
        
        const action = this.editingExercise ? 'actualizado' : 'creado';
        let message = `✅ Ejercicio "${exercise.title}" ${action}`;
        
        // ✅ NUEVO: Mensaje informativo según recursos
        if (exercise.hasFile && exercise.hasExternalUrl) {
          message += ' (con archivo y enlace)';
        } else if (exercise.hasFile) {
          message += ' (con archivo)';
        } else if (exercise.hasExternalUrl) {
          message += ' (con enlace externo)';
        }
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        
        this.exerciseCreated.emit(exercise);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error al guardar ejercicio:', error);
        
        let errorMessage = 'Error al guardar el ejercicio';
        
        // ✅ NUEVO: Mensaje específico para error de URL
        if (error.error?.error?.includes('URL')) {
          errorMessage = '❌ URL inválida. Debe comenzar con http:// o https://';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 4000,
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

  // ✅ NUEVO: Método auxiliar para validar URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}