import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Exercise, Submission } from '../../../../../../core/services/exercise.service';
import { ExerciseService } from '../../../../../../core/services/exercise.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MotivationalMessagesComponent } from '../../../motivational-messages/motivational-messages.component';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, MotivationalMessagesComponent, FormsModule],
  templateUrl: './exercise-list.component.html',
  styleUrls: ['./exercise-list.component.scss']
})
export class ExerciseListComponent implements OnInit, OnChanges {
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
  loadingHintsMap = new Map<number, boolean>();
  hintsChecked = false; // Flag para evitar múltiples verificaciones

  // 🆕 NUEVAS PROPIEDADES PARA FILTROS Y BÚSQUEDA
  filteredExercises: Exercise[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'all';
  
  // Opciones de filtro
  filterOptions = [
    { value: 'all', label: 'Todos los ejercicios', icon: '📚' },
    { value: 'submitted', label: 'Entregados sin calificar', icon: '📤' },
    { value: 'graded', label: 'Calificados', icon: '✅' },
    { value: 'not-submitted', label: 'Sin entregar', icon: '⏳' }
  ];

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit() {
    if (this.exercises.length > 0 && !this.hintsChecked) {
      this.checkHintsAvailabilityOptimized();
    }
    this.applyFilters(); // Aplicar filtros iniciales
  }

  ngOnChanges(changes: SimpleChanges) {
    // ✅ Verificar pistas cuando cambien los ejercicios
    if (changes['exercises'] && !changes['exercises'].firstChange) {
      const currentExercises = changes['exercises'].currentValue as Exercise[];
      if (currentExercises && currentExercises.length > 0) {
        this.checkHintsAvailabilityOptimized();
      }
    }

    // 🆕 Aplicar filtros cuando cambien los ejercicios o submissions
    if (changes['exercises'] || changes['submissions']) {
      this.applyFilters();
    }
  }

  // 🆕 MÉTODOS PARA FILTRADO Y BÚSQUEDA
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.exercises];

    // Aplicar filtro por estado
    filtered = filtered.filter(exercise => {
      const submission = this.getSubmission(exercise);
      
      switch (this.selectedFilter) {
        case 'submitted':
          return submission && submission.status !== 'GRADED';
        case 'graded':
          return submission && submission.status === 'GRADED';
        case 'not-submitted':
          return !submission;
        case 'all':
        default:
          return true;
      }
    });

    // Aplicar búsqueda por término
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(exercise => 
        exercise.title.toLowerCase().includes(term) ||
        exercise.description.toLowerCase().includes(term) ||
        exercise.difficulty.toLowerCase().includes(term)
      );
    }

    this.filteredExercises = filtered;
  }

  // 🆕 Obtener contadores para cada filtro
  getFilterCounts() {
    return {
      all: this.exercises.length,
      submitted: this.exercises.filter(ex => {
        const submission = this.getSubmission(ex);
        return submission && submission.status !== 'GRADED';
      }).length,
      graded: this.exercises.filter(ex => {
        const submission = this.getSubmission(ex);
        return submission && submission.status === 'GRADED';
      }).length,
      notSubmitted: this.exercises.filter(ex => !this.getSubmission(ex)).length
    };
  }

  // 🆕 Limpiar búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * 🚀 OPTIMIZADO: Verificar pistas de TODOS los ejercicios en paralelo con forkJoin
   */
  checkHintsAvailabilityOptimized() {
    if (this.exercises.length === 0) return;

    console.log('🔍 Verificando pistas para', this.exercises.length, 'ejercicios...');
    this.hintsChecked = true;

    // Crear array de observables
    const hintRequests = this.exercises
      .filter(ex => ex.id !== undefined)
      .map(exercise => {
        this.loadingHintsMap.set(exercise.id!, true);
        
        return this.exerciseService.getHintsByExercise(exercise.id!).pipe(
          map(hints => ({
            exerciseId: exercise.id!,
            hasHints: hints.length > 0
          })),
          catchError(error => {
            console.error(`❌ Error al verificar pistas para ejercicio ${exercise.id}:`, error);
            return of({
              exerciseId: exercise.id!,
              hasHints: false
            });
          })
        );
      });

    // ✅ Ejecutar TODAS las peticiones en paralelo
    forkJoin(hintRequests).subscribe({
      next: (results) => {
        results.forEach(result => {
          this.exercisesWithHints.set(result.exerciseId, result.hasHints);
          this.loadingHintsMap.set(result.exerciseId, false);
        });
        
        const totalWithHints = results.filter(r => r.hasHints).length;
        console.log(`✅ Verificación completada: ${totalWithHints}/${results.length} ejercicios tienen pistas`);
      },
      error: (error) => {
        console.error('❌ Error global al verificar pistas:', error);
        // Limpiar estados de carga
        this.exercises.forEach(ex => {
          if (ex.id) this.loadingHintsMap.set(ex.id, false);
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
    return this.loadingHintsMap.get(exercise.id) ?? false;
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
    console.log('💡 Emitiendo evento viewHints para:', exercise.title);
    // ✅ Emitir siempre, sin validación aquí
    this.viewHints.emit(exercise);
  }
}