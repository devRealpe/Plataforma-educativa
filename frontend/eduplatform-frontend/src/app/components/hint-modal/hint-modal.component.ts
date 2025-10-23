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
  templateUrl: './hint-modal.component.html',
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
  
  // Edición de pistas
  editingHint: Hint | null = null;
  editForm: Hint = {
    content: '',
    order: 1,
    cost: 0
  };

  newHint: Hint = {
    content: '',
    order: 1,
    cost: 0
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
    if (!this.newHint.content || !this.newHint.order) {
      this.snackBar.open('⚠️ Por favor completa todos los campos', 'Cerrar', { 
        duration: 2000 
      });
      return;
    }

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    this.exerciseService.createHint(this.newHint, this.exerciseId).subscribe({
      next: (hint) => {
        this.hints.push(hint);
        this.hints.sort((a, b) => a.order - b.order);
        
        this.snackBar.open('✅ Pista agregada exitosamente', 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        
        const nextOrder = this.hints.length > 0 
          ? Math.max(...this.hints.map(h => h.order)) + 1 
          : 1;
        
        this.newHint = {
          content: '',
          order: nextOrder,
          cost: 0
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

  startEdit(hint: Hint) {
    this.editingHint = hint;
    this.editForm = { ...hint };
  }

  cancelEdit() {
    this.editingHint = null;
    this.editForm = {
      content: '',
      order: 1,
      cost: 0
    };
  }

  saveEdit() {
    if (!this.editingHint?.id || !this.editForm.content || !this.editForm.order) {
      this.snackBar.open('⚠️ Por favor completa todos los campos', 'Cerrar', { 
        duration: 2000 
      });
      return;
    }

    this.exerciseService.updateHint(this.editingHint.id, this.editForm).subscribe({
      next: (updatedHint) => {
        const index = this.hints.findIndex(h => h.id === updatedHint.id);
        if (index !== -1) {
          this.hints[index] = updatedHint;
          this.hints.sort((a, b) => a.order - b.order);
        }
        
        this.snackBar.open('✅ Pista actualizada exitosamente', 'Cerrar', {
          duration: 2000,
          panelClass: ['success-snackbar']
        });
        
        this.cancelEdit();
      },
      error: (error) => {
        console.error('❌ Error al actualizar pista:', error);
        this.snackBar.open('Error al actualizar pista', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
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