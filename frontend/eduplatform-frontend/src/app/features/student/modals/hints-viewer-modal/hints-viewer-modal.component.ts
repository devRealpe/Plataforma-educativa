import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExerciseService, Hint } from '../../../../core/services/exercise.service';

/**
 * 💡 MODAL PARA VER PISTAS (ESTUDIANTE)
 * Muestra advertencia inicial y permite desbloquear pistas progresivamente
 */
@Component({
  selector: 'app-hints-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hints-viewer-modal.component.html',
  styleUrls: ['./hints-viewer-modal.component.scss']
})
export class HintsViewerModalComponent implements OnInit {
  @Input() exerciseId!: number;
  @Input() exerciseTitle: string = '';
  @Output() closeModal = new EventEmitter<void>();

  hints: Hint[] = [];
  isLoading = true;
  showWarning = true; // Mostrar advertencia inicial
  unlockedHints: Set<number> = new Set(); // Pistas desbloqueadas

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
        // Ordenar por orden
        this.hints = hints.sort((a, b) => (a.order || 0) - (b.order || 0));
        this.isLoading = false;
        console.log(`✅ ${hints.length} pistas cargadas`);
      },
      error: (error) => {
        console.error('❌ Error al cargar pistas:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar las pistas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Aceptar la advertencia y continuar
   */
  acceptWarning() {
    this.showWarning = false;
  }

  /**
   * Desbloquear una pista específica
   */
  unlockHint(hintId: number) {
    this.unlockedHints.add(hintId);
    this.snackBar.open('💡 Pista desbloqueada', '', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Verificar si una pista está desbloqueada
   */
  isHintUnlocked(hintId: number): boolean {
    return this.unlockedHints.has(hintId);
  }

  /**
   * Obtener el número de pistas desbloqueadas
   */
  get unlockedCount(): number {
    return this.unlockedHints.size;
  }

  /**
   * Cerrar modal
   */
  close() {
    this.closeModal.emit();
  }

  /**
   * Cerrar modal desde advertencia
   */
  closeFromWarning() {
    this.close();
  }
}