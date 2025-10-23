import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-exercise-modal',
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
              <h2 class="modal-title">{{ editingExercise ? '✏️ Editar Ejercicio' : '📝 Crear Ejercicio' }}</h2>
              <p class="modal-subtitle">{{ editingExercise ? 'Actualiza la información del ejercicio' : 'Agrega un nuevo ejercicio al curso' }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="modal-form">
          <!-- Título -->
          <div class="form-group">
            <label for="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              Título del Ejercicio
              <span class="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              class="form-input"
              [(ngModel)]="exerciseForm.title"
              name="title"
              placeholder="Ej: Ejercicio de Estructuras de Control"
              required
              maxlength="100"
            />
          </div>

          <!-- Descripción -->
          <div class="form-group">
            <label for="description">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Descripción
              <span class="required">*</span>
            </label>
            <textarea
              id="description"
              class="form-textarea"
              [(ngModel)]="exerciseForm.description"
              name="description"
              placeholder="Describe las instrucciones y objetivos del ejercicio..."
              rows="5"
              required
              maxlength="1000"
            ></textarea>
            <div class="char-count">
              <span [class.char-limit]="exerciseForm.description.length > 900">
                {{ exerciseForm.description.length }}/1000
              </span>
              caracteres
            </div>
          </div>

          <!-- Dificultad y Puntos -->
          <div class="form-row">
            <div class="form-group">
              <label for="difficulty">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                  <polyline points="2 17 12 22 22 17"/>
                  <polyline points="2 12 12 17 22 12"/>
                </svg>
                Dificultad
                <span class="required">*</span>
              </label>
              <select
                id="difficulty"
                class="form-select"
                [(ngModel)]="exerciseForm.difficulty"
                name="difficulty"
                required
              >
                <option value="">Seleccionar</option>
                <option value="Principiante">🌱 Principiante</option>
                <option value="Intermedio">🎯 Intermedio</option>
                <option value="Avanzado">🚀 Avanzado</option>
                <option value="Experto">⭐ Experto</option>
              </select>
            </div>

            <div class="form-group">
              <label for="points">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Puntos XP
                <span class="required">*</span>
              </label>
              <input
                type="number"
                id="points"
                class="form-input"
                [(ngModel)]="exerciseForm.points"
                name="points"
                placeholder="100"
                required
                min="1"
                max="1000"
              />
            </div>
          </div>

          <!-- Fecha Límite -->
          <div class="form-group">
            <label for="deadline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Fecha Límite (Opcional)
            </label>
            <input
              type="datetime-local"
              id="deadline"
              class="form-input"
              [(ngModel)]="exerciseForm.deadline"
              name="deadline"
            />
          </div>

          <!-- Archivo -->
          <div class="form-group">
            <label>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Archivo del Ejercicio {{ editingExercise ? '(Opcional)' : '' }}
            </label>
            
            <div class="file-upload-area" *ngIf="!selectedFile && !editingExercise?.fileName">
              <input
                type="file"
                id="exercise-file"
                class="file-input"
                (change)="onFileSelected($event)"
                accept=".pdf,.zip,.rar,.txt,.doc,.docx"
              />
              <label for="exercise-file" class="file-label">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Haz clic para seleccionar archivo</span>
                <span class="file-hint">PDF, ZIP, documentos (máx. 10MB)</span>
              </label>
            </div>

            <div class="file-selected" *ngIf="selectedFile || editingExercise?.fileName">
              <div class="file-info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
                <span>{{ selectedFile?.name || editingExercise?.fileName }}</span>
              </div>
              <button type="button" class="remove-file-btn" (click)="removeFile()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>Tip:</strong> Después de crear el ejercicio, podrás agregar pistas para ayudar a los estudiantes.
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="close()">
              Cancelar
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="!isFormValid() || isSubmitting"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ isSubmitting ? '⏳ Guardando...' : (editingExercise ? '💾 Guardar Cambios' : '🚀 Crear Ejercicio') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    $primary-blue: #2563eb;
    $success-green: #10b981;
    $danger-red: #dc2626;
    $gray-50: #f9fafb;
    $gray-100: #f3f4f6;
    $gray-200: #e5e7eb;
    $gray-300: #d1d5db;
    $gray-400: #9ca3af;
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
      border-radius: 20px;
      width: 100%;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideUp 0.3s ease-out;
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
      position: relative;
      padding: 2rem;
      background: linear-gradient(135deg, $primary-blue 0%, #8b5cf6 100%);
      border-radius: 20px 20px 0 0;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
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
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.375rem;
      line-height: 1.2;
    }

    .modal-subtitle {
      font-size: 0.95rem;
      opacity: 0.95;
      line-height: 1.4;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      color: white;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: rotate(90deg);
      }
    }

    .modal-form {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.75rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: $gray-700;
      margin-bottom: 0.625rem;

      svg {
        color: $primary-blue;
      }

      .required {
        color: $danger-red;
        font-size: 1.1rem;
      }
    }

    .form-input, .form-select, .form-textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid $gray-200;
      border-radius: 10px;
      font-size: 0.95rem;
      color: $gray-900;
      transition: all 0.2s ease;
      font-family: inherit;
      background: white;
      box-sizing: border-box;

      &::placeholder {
        color: $gray-400;
      }

      &:focus {
        outline: none;
        border-color: $primary-blue;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        transform: translateY(-1px);
      }

      &:hover:not(:focus) {
        border-color: $gray-300;
      }
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
      line-height: 1.6;
    }

    .char-count {
      text-align: right;
      font-size: 0.8rem;
      color: $gray-400;
      margin-top: 0.5rem;
      font-weight: 500;

      .char-limit {
        color: #f59e0b;
      }
    }

    .file-upload-area {
      position: relative;
    }

    .file-input {
      display: none;
    }

    .file-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      border: 2px dashed $gray-300;
      border-radius: 12px;
      background: $gray-50;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: $primary-blue;
        background: #eff6ff;
      }

      svg {
        color: $primary-blue;
        margin-bottom: 1rem;
      }

      span:first-of-type {
        font-weight: 600;
        color: $gray-700;
        margin-bottom: 0.5rem;
      }

      .file-hint {
        font-size: 0.875rem;
        color: $gray-600;
      }
    }

    .file-selected {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: #eff6ff;
      border: 2px solid $primary-blue;
      border-radius: 10px;

      .file-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: $gray-700;
        font-weight: 500;

        svg {
          color: $primary-blue;
          flex-shrink: 0;
        }
      }
    }

    .remove-file-btn {
      background: rgba(220, 38, 38, 0.1);
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      color: $danger-red;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: $danger-red;
        color: white;
      }
    }

    .info-box {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%);
      border-left: 4px solid $primary-blue;
      border-radius: 10px;
      font-size: 0.875rem;
      color: $gray-700;
      margin-bottom: 1.5rem;

      svg {
        flex-shrink: 0;
        color: $primary-blue;
      }

      strong {
        color: $primary-blue;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .cancel-btn {
      flex: 1;
      padding: 0.875rem 1.5rem;
      background: white;
      color: $gray-700;
      border: 2px solid $gray-200;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: $gray-50;
        border-color: $gray-300;
      }
    }

    .submit-btn {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, $primary-blue 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        background: $gray-300;
        cursor: not-allowed;
        opacity: 0.6;
        box-shadow: none;
      }
    }

    @media (max-width: 640px) {
      .modal-container {
        border-radius: 0;
        max-height: 100vh;
      }

      .modal-header {
        padding: 1.5rem;
        border-radius: 0;
      }

      .modal-form {
        padding: 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
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
    points: 100,
    deadline: ''
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
      this.exerciseForm.difficulty &&
      this.exerciseForm.points && this.exerciseForm.points > 0
    );
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.exerciseForm.courseId = this.courseId;

    if (this.editingExercise?.id) {
      // Actualizar ejercicio
      this.exerciseService.updateExercise(
        this.editingExercise.id,
        this.exerciseForm,
        this.selectedFile || undefined
      ).subscribe({
        next: (exercise) => {
          this.snackBar.open('✅ Ejercicio actualizado', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.exerciseCreated.emit(exercise);
          this.close();
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.snackBar.open('Error al actualizar ejercicio', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      // Crear ejercicio
      this.exerciseService.createExercise(this.exerciseForm, this.selectedFile || undefined).subscribe({
        next: (exercise) => {
          this.snackBar.open('✅ Ejercicio creado', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.exerciseCreated.emit(exercise);
          this.close();
        },
        error: (error) => {
          console.error('❌ Error:', error);
          this.snackBar.open('Error al crear ejercicio', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
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