import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../../../core/services/course.service';
import { ExerciseService, Exercise } from '../../../../core/services/exercise.service';
import { ExerciseModalComponent } from '../exercise-modal/exercise-modal.component';
import { HintModalComponent } from '../hint-modal/hint-modal.component';
import { ManageStudentsModalComponent } from '../manage-students-modal/manage-students-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { SubmissionsModalComponent } from '../submissions-modal/submissions-modal.component';
import { PodiumComponent } from '../../../../shared/components/podium/podium.component';
import { ChallengeService, Challenge } from '../../../../core/services/challenge.service';
import { ChallengeSubmissionsListModalComponent } from '../../modals/challenge-submissions-list-modal/challenge-submissions-list-modal.component';
import { ChallengeModalComponent } from '../../modals/challenge-modal/challenge-modal.component';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    ExerciseModalComponent,
    HintModalComponent,
    ManageStudentsModalComponent,
    ConfirmationModalComponent,
    SubmissionsModalComponent,
    PodiumComponent,
    ChallengeSubmissionsListModalComponent,
    ChallengeModalComponent
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  challenges: Challenge[] = [];
  isLoading = true;
  isLoadingChallenges = false;
  isTeacher: boolean = true;

  // Modal states
  showExerciseModal = false;
  showHintModal = false;
  showStudentsModal = false;
  showDeleteConfirmModal = false;
  showSubmissionsModal = false;
  showChallengeSubmissionsModal = false;
  showChallengeModal = false;
  showPodium = true;
  showDeleteChallengeModal = false;
  
  editingExercise: Exercise | null = null;
  selectedExercise: Exercise | null = null;
  exerciseToDelete: Exercise | null = null;
  selectedChallenge: Challenge | null = null;
  editingChallenge: Challenge | null = null;
  challengeToDelete: Challenge | null = null;

  // Tab Navigation
  activeTab: 'exercises' | 'challenges' | 'podium' = 'exercises';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private exerciseService: ExerciseService,
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseData();
    this.loadChallenges();
  }

  // ========== MÉTODOS PARA MANEJAR RETOS ==========

  openChallengeModal(challenge?: Challenge) {
    this.editingChallenge = challenge || null;
    this.showChallengeModal = true;
  }

  closeChallengeModal() {
    this.showChallengeModal = false;
    this.editingChallenge = null;
  }

  handleChallengeCreated(challenge: Challenge) {
    if (this.editingChallenge) {
      const index = this.challenges.findIndex(c => c.id === challenge.id);
      if (index !== -1) {
        this.challenges[index] = challenge;
      }
    } else {
      this.challenges.push(challenge);
    }
    
    this.closeChallengeModal();
    
    const action = this.editingChallenge ? 'actualizado' : 'creado';
    this.snackBar.open(
      `✅ Reto "${challenge.title}" ${action} exitosamente`,
      'Cerrar',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  editChallenge(challenge: Challenge) {
    this.editingChallenge = challenge;
    this.showChallengeModal = true;
  }

  deleteChallenge(challenge: Challenge) {
    this.challengeToDelete = challenge;
    this.showDeleteChallengeModal = true;
  }

  confirmDeleteChallenge() {
    if (!this.challengeToDelete?.id) return;

    const challengeId = this.challengeToDelete.id;
    const challengeTitle = this.challengeToDelete.title;

    this.showDeleteChallengeModal = false;

    this.challengeService.deleteChallenge(challengeId).subscribe({
      next: () => {
        this.challenges = this.challenges.filter(c => c.id !== challengeId);
        this.snackBar.open(
          `✅ Reto "${challengeTitle}" eliminado`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.challengeToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar reto:', error);
        this.snackBar.open('Error al eliminar reto', 'Cerrar', { duration: 3000 });
        this.challengeToDelete = null;
      }
    });
  }

  cancelDeleteChallenge() {
    this.showDeleteChallengeModal = false;
    this.challengeToDelete = null;
  }

  // ========== TAB NAVIGATION ==========

  setActiveTab(tab: 'exercises' | 'challenges' | 'podium') {
    this.activeTab = tab;
  }

  loadChallenges() {
    this.isLoadingChallenges = true;
    this.challengeService.getChallengesByCourse(this.courseId).subscribe({
      next: (challenges) => {
        this.challenges = challenges;
        this.isLoadingChallenges = false;
        console.log('✅ Retos cargados:', challenges);
      },
      error: (error) => {
        console.error('❌ Error al cargar retos:', error);
        this.isLoadingChallenges = false;
      }
    });
  }

  viewChallengeSubmissions(challenge: Challenge) {
    console.log('🔍 Viendo soluciones del reto:', challenge.title);
    this.selectedChallenge = challenge;
    this.showChallengeSubmissionsModal = true;
  }

  closeChallengeSubmissionsModal() {
    this.showChallengeSubmissionsModal = false;
    this.selectedChallenge = null;
  }

  loadCourseData() {
    this.isLoading = true;
    
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
    if (this.editingExercise) {
      const index = this.exercises.findIndex(e => e.id === exercise.id);
      if (index !== -1) {
        this.exercises[index] = exercise;
      }
    } else {
      this.exercises.push(exercise);
    }
    
    const action = this.editingExercise ? 'actualizado' : 'creado';
    this.snackBar.open(
      `✅ Ejercicio "${exercise.title}" ${action} exitosamente`,
      'Cerrar',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  editExercise(exercise: Exercise) {
    this.editingExercise = { ...exercise };
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
    this.loadCourseData();
  }

  // ========== ENTREGAS ==========

  viewSubmissions(exercise: Exercise) {
    console.log('🔍 Viendo entregas del ejercicio:', exercise.title);
    this.selectedExercise = exercise;
    this.showSubmissionsModal = true;
  }

  closeSubmissionsModal() {
    this.showSubmissionsModal = false;
    this.selectedExercise = null;
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
      'Experto': '#8b5cf6',
      'BASICO': '#10b981',
      'INTERMEDIO': '#f59e0b',
      'AVANZADO': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  }

  getDeleteMessage(): string {
    return `¿Estás seguro de que deseas eliminar el ejercicio "${this.exerciseToDelete?.title || ''}"?\n\nEsta acción eliminará:\n• El ejercicio y sus archivos\n• Todas las pistas asociadas\n• Todas las entregas de estudiantes\n\nEsta acción no se puede deshacer.`;
  }

  getDeleteChallengeMessage(): string {
    return `¿Estás seguro de que deseas eliminar el reto "${this.challengeToDelete?.title || ''}"?\n\nEsta acción eliminará:\n• El reto y sus archivos\n• Todas las soluciones enviadas\n• Las bonificaciones otorgadas\n\nEsta acción no se puede deshacer.`;
  }
}