import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../services/course.service';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import { ExerciseModalComponent } from '../exercise-modal/exercise-modal.component';
import { HintModalComponent } from '../hint-modal/hint-modal.component';
import { ManageStudentsModalComponent } from '../manage-students-modal/manage-students-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseModalComponent,
    HintModalComponent,
    ManageStudentsModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  isLoading = true;

  // Modal states
  showExerciseModal = false;
  showHintModal = false;
  showStudentsModal = false;
  showDeleteConfirmModal = false;
  
  editingExercise: Exercise | null = null;
  selectedExercise: Exercise | null = null;
  exerciseToDelete: Exercise | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseData();
  }

  loadCourseData() {
    this.isLoading = true;
    
    // Cargar información del curso
    this.courseService.getMyCourses().subscribe({
      next: (courses) => {
        this.course = courses.find(c => c.id === this.courseId) || null;
        
        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/teacher-dashboard']);
          return;
        }
        
        this.loadExercises();
      },
      error: (error) => {
        console.error('❌ Error al cargar curso:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar el curso', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadExercises() {
    this.exerciseService.getExercisesByCourse(this.courseId).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.isLoading = false;
        console.log('✅ Ejercicios cargados:', exercises);
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ========== EJERCICIOS ==========

  openExerciseModal() {
    this.editingExercise = null;
    this.showExerciseModal = true;
  }

  closeExerciseModal() {
    this.showExerciseModal = false;
    this.editingExercise = null;
  }

  handleExerciseCreated(exercise: Exercise) {
    this.exercises.push(exercise);
    this.snackBar.open(
      `✅ Ejercicio "${exercise.title}" creado exitosamente`,
      'Cerrar',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  editExercise(exercise: Exercise) {
    this.editingExercise = exercise;
    this.showExerciseModal = true;
  }

  deleteExercise(exercise: Exercise) {
    this.exerciseToDelete = exercise;
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteExercise() {
    if (!this.exerciseToDelete?.id) return;

    const exerciseId = this.exerciseToDelete.id;
    const exerciseTitle = this.exerciseToDelete.title;

    this.showDeleteConfirmModal = false;

    this.exerciseService.deleteExercise(exerciseId).subscribe({
      next: () => {
        this.exercises = this.exercises.filter(e => e.id !== exerciseId);
        this.snackBar.open(
          `✅ Ejercicio "${exerciseTitle}" eliminado`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.exerciseToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar ejercicio:', error);
        this.snackBar.open('Error al eliminar ejercicio', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.exerciseToDelete = null;
      }
    });
  }

  cancelDeleteExercise() {
    this.showDeleteConfirmModal = false;
    this.exerciseToDelete = null;
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
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ========== PISTAS ==========

  manageHints(exercise: Exercise) {
    this.selectedExercise = exercise;
    this.showHintModal = true;
  }

  closeHintModal() {
    this.showHintModal = false;
    this.selectedExercise = null;
  }

  // ========== ESTUDIANTES ==========

  manageStudents() {
    this.showStudentsModal = true;
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    // Recargar datos del curso para actualizar el contador
    this.loadCourseData();
  }

  // ========== ENTREGAS ==========

  viewSubmissions(exercise: Exercise) {
    if (!exercise.id) return;
    this.router.navigate(['/submissions', exercise.id]);
  }

  // ========== UTILIDADES ==========

  goBack() {
    this.router.navigate(['/teacher-dashboard']);
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

  getDeleteMessage(): string {
    return `¿Estás seguro de que deseas eliminar el ejercicio "${this.exerciseToDelete?.title || ''}"? Esta acción no se puede deshacer.`;
  }
}