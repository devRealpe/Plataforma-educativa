import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Hint } from '../../services/exercise.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-hint-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">💡 Gestionar Pistas</h2>
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
          <!-- Add Hint Form -->
          <div class="add-hint-section">
            <h3 class="section-title">Agregar Nueva Pista</h3>
            <form (ngSubmit)="addHint()" class="hint-form">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Contenido de la Pista *</label>
                  <textarea
                    [(ngModel)]="newHint.content"
                    name="content"
                    placeholder="Escribe una pista útil para los estudiantes..."
                    rows="3"
                    required
                    class="form-input"
                  ></textarea>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    [(ngModel)]="newHint.order"
                    name="order"
                    min="1"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Costo (XP)</label>
                  <input
                    type="number"
                    [(ngModel)]="newHint.cost"
                    name="cost"
                    min="0"
                    class="form-input"
                    required
                  />
                </div>
                <button type="submit" class="add-btn" [disabled]="isSubmitting">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Agregar
                </button>
              </div>
            </form>
          </div>

          <!-- Hints List -->
          <div class="hints-section">
            <h3 class="section-title">Pistas Existentes ({{ hints.length }})</h3>
            
            <div *ngIf="isLoading" class="loading">
              <div class="spinner"></div>
              <p>Cargando pistas...</p>
            </div>

            <div *ngIf="!isLoading && hints.length === 0" class="empty-state">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <h4>No hay pistas agregadas</h4>
              <p>Agrega pistas para ayudar a los estudiantes con este ejercicio</p>
            </div>

            <div *ngIf="!isLoading && hints.length > 0" class="hints-list">
              <div *ngFor="let hint of hints; let i = index" class="hint-card">
                <div class="hint-header">
                  <div class="hint-badge">Pista {{ hint.order }}</div>
                  <div class="hint-cost">-{{ hint.cost }} XP</div>
                </div>
                <p class="hint-content">{{ hint.content }}</p>
                <div class="hint-actions">
                  <button class="edit-btn" (click)="editHint(hint)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                  <button class="delete-btn" (click)="deleteHint(hint)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      *ngIf="showDeleteConfirmModal && hintToDelete"
      title="¿Eliminar pista?"
      message="¿Estás seguro de que deseas eliminar esta pista? Esta acción no se puede deshacer."
      confirmText="Eliminar"
      cancelText="Cancelar"
      type="danger"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()"
    >
    </app-confirmation-modal>
  `,
  styleUrls: ['./hint-modal.component.scss']
})
export class HintModalComponent implements OnInit {
  @Input() exerciseId!: number;
  @Input() exerciseTitle: string = '';
  @Output() closeModal = new EventEmitter<void>();

  hints: Hint[] = [];
  isLoading = true;
  isSubmitting = false;
  showDeleteConfirmModal = false;
  hintToDelete: Hint | null = null;

  newHint: Hint = {
    content: '',
    order: 1,
    cost: 10
  };

  constructor(
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadHints();
  }

  loadHints() {
    this.isLoading = true;
    this.exerciseService.getHintsByExercise(this.exerciseId).subscribe({
      next: (hints) => {
        this.hints = hints;
        this.isLoading = false;
        // Ajustar el orden de la nueva pista
        if (hints.length > 0) {
          this.newHint.order = Math.max(...hints.map(h => h.order)) + 1;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar pistas:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar pistas', 'Cerrar', { duration: 3000 });
      }
    });
  }

  addHint() {
    if (!this.newHint.content || this.isSubmitting) return;

    this.isSubmitting = true;
    this.exerciseService.createHint(this.newHint, this.exerciseId).subscribe({
      next: (hint) => {
        this.hints.push(hint);
        this.hints.sort((a, b) => a.order - b.order);
        this.snackBar.open('✅ Pista agregada exitosamente', 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        // Reset form
        this.newHint = {
          content: '',
          order: this.newHint.order + 1,
          cost: 10
        };
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('❌ Error al agregar pista:', error);
        this.snackBar.open('Error al agregar pista', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  editHint(hint: Hint) {
    // TODO: Implementar edición
    this.snackBar.open('Función de edición próximamente', 'Cerrar', { duration: 2000 });
  }

  deleteHint(hint: Hint) {
    this.hintToDelete = hint;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (!this.hintToDelete?.id) return;

    this.showDeleteConfirmModal = false;

    this.exerciseService.deleteHint(this.hintToDelete.id).subscribe({
      next: () => {
        this.hints = this.hints.filter(h => h.id !== this.hintToDelete!.id);
        this.snackBar.open('✅ Pista eliminada', 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        this.hintToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar pista:', error);
        this.snackBar.open('Error al eliminar pista', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.hintToDelete = null;
      }
    });
  }

  cancelDelete() {
    this.showDeleteConfirmModal = false;
    this.hintToDelete = null;
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
