import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services
import {
  CourseService,
  Course,
} from '../../../../../../core/services/course.service';
import {
  ExerciseService,
  Exercise,
} from '../../../../../../core/services/exercise.service';
import {
  ChallengeService,
  Challenge,
} from '../../../../../../core/services/challenge.service';

// Modales
import { ExerciseModalComponent } from '../../../../modals/exercise-modal/exercise-modal.component';
import { HintModalComponent } from '../../../../modals/hint-modal/hint-modal.component';
import { ManageStudentsModalComponent } from '../../../../modals/manage-students-modal/manage-students-modal.component';
import { ConfirmationModalComponent } from '../../../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { SubmissionsModalComponent } from '../../../../modals/submissions-modal/submissions-modal.component';
import { ChallengeModalComponent } from '../../../../modals/challenge-modal/challenge-modal.component';
import { ChallengeSubmissionsListModalComponent } from '../../../../modals/challenge-submissions-list-modal/challenge-submissions-list-modal.component';

// Componentes de presentación
import { PodiumComponent } from '../../../../../../shared/components/podium/podium.component';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { ChallengeListComponent } from '../challenge-list/challenge-list.component';

// Link whatsapp
import { WhatsappModalComponent } from '../../../../modals/whatsapp-modal/whatsapp-modal.component';

/**
 * 🎯 ORQUESTADOR PRINCIPAL DE COURSE DETAIL
 *
 * Este componente actúa como:
 * - Contenedor principal de la vista de detalle del curso
 * - Coordinador de todos los componentes hijos
 * - Gestor del estado global (curso, ejercicios, retos)
 * - Controlador de modales
 * - Router principal de la sección
 *
 * Reemplaza completamente a CourseDetailComponent
 */
@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [
    CommonModule,
    // Modales
    ExerciseModalComponent,
    HintModalComponent,
    ManageStudentsModalComponent,
    ConfirmationModalComponent,
    SubmissionsModalComponent,
    ChallengeModalComponent,
    ChallengeSubmissionsListModalComponent,
    // Componentes
    PodiumComponent,
    ExerciseListComponent,
    ChallengeListComponent,
    WhatsappModalComponent,
  ],

  templateUrl: './course-header.component.html',
  styleUrls: ['./course-header.component.scss'],
})
export class CourseHeaderComponent implements OnInit {
  // ==========================================
  // ESTADO DEL CURSO
  // ==========================================
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  challenges: Challenge[] = [];
  isLoading = true;
  isLoadingChallenges = false;

  // ==========================================
  // ESTADO DE MODALES
  // ==========================================
  showExerciseModal = false;
  showHintModal = false;
  showStudentsModal = false;
  showDeleteConfirmModal = false;
  showSubmissionsModal = false;
  showChallengeSubmissionsModal = false;
  showChallengeModal = false;
  showDeleteChallengeModal = false;

  editingExercise: Exercise | null = null;
  selectedExercise: Exercise | null = null;
  exerciseToDelete: Exercise | null = null;
  selectedChallenge: Challenge | null = null;
  editingChallenge: Challenge | null = null;
  challengeToDelete: Challenge | null = null;

  // Propiedades para gestión de WhatsApp
  showWhatsappModal = false;
  currentWhatsappLink: string | null = null;

  // ==========================================
  // NAVEGACIÓN
  // ==========================================
  activeTab: 'exercises' | 'challenges' | 'podium' = 'exercises';

  // ==========================================
  // 🆕 GETTERS PARA LAS PROPIEDADES FALTANTES
  // ==========================================
  get exerciseCount(): number {
    return this.exercises.length;
  }

  get challengeCount(): number {
    return this.challenges.length;
  }

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

    if (!this.courseId || isNaN(this.courseId)) {
      console.error('❌ ID de curso inválido');
      this.snackBar.open('ID de curso inválido', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/teacher-dashboard']);
      return;
    }

    console.log('🚀 Inicializando Course Header con ID:', this.courseId);
    this.loadCourseData();
    this.loadChallenges();
  }

  // ==========================================
  // 📊 CARGA DE DATOS
  // ==========================================

  loadCourseData() {
    this.isLoading = true;

    this.courseService.getMyCourses().subscribe({
      next: (courses) => {
        this.course = courses.find((c) => c.id === this.courseId) || null;

        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/teacher-dashboard']);
          return;
        }

        console.log('✅ Curso cargado:', this.course.title);
        this.loadExercises();
      },
      error: (error) => {
        console.error('❌ Error al cargar curso:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar el curso', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  loadExercises() {
    this.exerciseService.getExercisesByCourse(this.courseId).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.isLoading = false;
        console.log(`✅ ${exercises.length} ejercicios cargados`);
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  loadChallenges() {
    this.isLoadingChallenges = true;
    this.challengeService.getChallengesByCourse(this.courseId).subscribe({
      next: (challenges) => {
        this.challenges = challenges;
        this.isLoadingChallenges = false;
        console.log(`✅ ${challenges.length} retos cargados`);
      },
      error: (error) => {
        console.error('❌ Error al cargar retos:', error);
        this.isLoadingChallenges = false;
      },
    });
  }

  // ==========================================
  // 🔄 NAVEGACIÓN
  // ==========================================

  goBack() {
    this.router.navigate(['/teacher-dashboard']);
  }

  // 🆕 MÉTODO FALTANTE: onTabChange
  onTabChange(tab: 'exercises' | 'challenges' | 'podium') {
    this.activeTab = tab;
    console.log('📑 Tab cambiado a:', tab);
  }

  setActiveTab(tab: 'exercises' | 'challenges' | 'podium') {
    this.activeTab = tab;
  }

  // ==========================================
  // 👥 GESTIÓN DE ESTUDIANTES
  // ==========================================

  // 🆕 MÉTODO RENOMBRADO: onManageStudents
  onManageStudents() {
    this.openManageStudents();
  }

  openManageStudents() {
    this.showStudentsModal = true;
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    // Recargar datos por si cambió el número de estudiantes
    this.loadCourseData();
  }

  // ==========================================
  // 📝 GESTIÓN DE EJERCICIOS
  // ==========================================
    /**
   * 🔄 ACTUALIZACIÓN DE EJERCICIO
   * Este método DEBE estar dentro de la clase
   */
  onExerciseUpdated(exerciseId: number) {
    console.log('🔄 Ejercicio actualizado ID:', exerciseId);
    console.log('📊 Recargando lista de ejercicios...');
    
    // Recargar la lista completa
    this.loadExercises();
    
    // Mostrar notificación
    this.snackBar.open('✅ Lista actualizada', '', {
      duration: 1500,
    });
  }

  // 🆕 MÉTODO RENOMBRADO: onCreateExercise
  onCreateExercise() {
    this.openCreateExercise();
  }

  openCreateExercise() {
    this.editingExercise = null;
    this.showExerciseModal = true;
  }

  openEditExercise(exercise: Exercise) {
    this.editingExercise = { ...exercise };
    this.showExerciseModal = true;
  }

  openDeleteExercise(exercise: Exercise) {
    this.exerciseToDelete = exercise;
    this.showDeleteConfirmModal = true;
  }

  handleExerciseCreated(exercise: Exercise) {
    if (this.editingExercise) {
      // Actualizar ejercicio existente
      const index = this.exercises.findIndex((e) => e.id === exercise.id);
      if (index !== -1) {
        this.exercises[index] = exercise;
      }
    } else {
      // Agregar nuevo ejercicio
      this.exercises.push(exercise);
    }

    this.closeExerciseModal();

    const action = this.editingExercise ? 'actualizado' : 'creado';
    this.snackBar.open(
      `✅ Ejercicio "${exercise.title}" ${action} exitosamente`,
      'Cerrar',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  confirmDeleteExercise() {
    if (!this.exerciseToDelete?.id) return;

    const exerciseId = this.exerciseToDelete.id;
    const exerciseTitle = this.exerciseToDelete.title;

    this.showDeleteConfirmModal = false;

    this.exerciseService.deleteExercise(exerciseId).subscribe({
      next: () => {
        this.exercises = this.exercises.filter((e) => e.id !== exerciseId);
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
          panelClass: ['error-snackbar'],
        });
        this.exerciseToDelete = null;
      },
    });
  }

  closeExerciseModal() {
    this.showExerciseModal = false;
    this.editingExercise = null;
  }

  cancelDeleteExercise() {
    this.showDeleteConfirmModal = false;
    this.exerciseToDelete = null;
  }

  // ==========================================
  // 💡 GESTIÓN DE PISTAS
  // ==========================================

  openManageHints(exercise: Exercise) {
    this.selectedExercise = exercise;
    this.showHintModal = true;
  }

  closeHintModal() {
    this.showHintModal = false;
    this.selectedExercise = null;
  }

  // ==========================================
  // 📥 DESCARGAS
  // ==========================================

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

        this.snackBar.open('✅ Archivo descargado', 'Cerrar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  downloadChallenge(challenge: Challenge) {
    if (!challenge.id || !challenge.fileName) {
      this.snackBar.open('❌ No hay archivo disponible', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.challengeService.downloadChallenge(challenge.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = challenge.fileName || 'reto.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.snackBar.open('✅ Archivo descargado', 'Cerrar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  // ==========================================
  // 👁️ VER ENTREGAS/SOLUCIONES
  // ==========================================

  viewExerciseSubmissions(exercise: Exercise) {
    this.selectedExercise = exercise;
    this.showSubmissionsModal = true;
  }

  closeSubmissionsModal() {
    this.showSubmissionsModal = false;
    this.selectedExercise = null;
  }

  viewChallengeSubmissions(challenge: Challenge) {
    this.selectedChallenge = challenge;
    this.showChallengeSubmissionsModal = true;
  }

  closeChallengeSubmissionsModal() {
    this.showChallengeSubmissionsModal = false;
    this.selectedChallenge = null;
  }

  // ==========================================
  // 🏆 GESTIÓN DE RETOS
  // ==========================================

  // 🆕 MÉTODO RENOMBRADO: onCreateChallenge
  onCreateChallenge() {
    this.openCreateChallenge();
  }

  openCreateChallenge() {
    this.editingChallenge = null;
    this.showChallengeModal = true;
  }

  openEditChallenge(challenge: Challenge) {
    this.editingChallenge = challenge;
    this.showChallengeModal = true;
  }

  openDeleteChallenge(challenge: Challenge) {
    this.challengeToDelete = challenge;
    this.showDeleteChallengeModal = true;
  }

  handleChallengeCreated(challenge: Challenge) {
    if (this.editingChallenge) {
      // Actualizar reto existente
      const index = this.challenges.findIndex((c) => c.id === challenge.id);
      if (index !== -1) {
        this.challenges[index] = challenge;
      }
    } else {
      // Agregar nuevo reto
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

  confirmDeleteChallenge() {
    if (!this.challengeToDelete?.id) return;

    const challengeId = this.challengeToDelete.id;
    const challengeTitle = this.challengeToDelete.title;

    this.showDeleteChallengeModal = false;

    this.challengeService.deleteChallenge(challengeId).subscribe({
      next: () => {
        this.challenges = this.challenges.filter((c) => c.id !== challengeId);
        this.snackBar.open(`✅ Reto "${challengeTitle}" eliminado`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.challengeToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar reto:', error);
        this.snackBar.open('Error al eliminar reto', 'Cerrar', {
          duration: 3000,
        });
        this.challengeToDelete = null;
      },
    });
  }

  closeChallengeModal() {
    this.showChallengeModal = false;
    this.editingChallenge = null;
  }

  cancelDeleteChallenge() {
    this.showDeleteChallengeModal = false;
    this.challengeToDelete = null;
  }

  // ==========================================
  // 🔗 GESTIÓN DE URLs EXTERNAS
  // ==========================================

  openExternalUrl(url: string) {
    if (!url) {
      this.snackBar.open('❌ No hay URL disponible', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    try {
      new URL(url); // Validar URL
      window.open(url, '_blank', 'noopener,noreferrer');
      this.snackBar.open('🔗 Abriendo enlace externo...', '', {
        duration: 2000,
        panelClass: ['success-snackbar'],
      });
    } catch (error) {
      console.error('❌ URL inválida:', url, error);
      this.snackBar.open('❌ URL inválida', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }

  // ==========================================
  // 🛠️ UTILIDADES
  // ==========================================

  getDeleteExerciseMessage(): string {
    return `¿Estás seguro de que deseas eliminar el ejercicio "${
      this.exerciseToDelete?.title || ''
    }"?\n\nEsta acción eliminará:\n• El ejercicio y sus archivos\n• Todas las pistas asociadas\n• Todas las entregas de estudiantes\n\nEsta acción no se puede deshacer.`;
  }

  getDeleteChallengeMessage(): string {
    return `¿Estás seguro de que deseas eliminar el reto "${
      this.challengeToDelete?.title || ''
    }"?\n\nEsta acción eliminará:\n• El reto y sus archivos\n• Todas las soluciones enviadas\n• Las bonificaciones otorgadas\n\nEsta acción no se puede deshacer.`;
  }

  // Metodos para whatsapp link

  /**
   * Abre el modal para gestionar el enlace de WhatsApp
   */
  openWhatsappModal() {
    if (this.course?.whatsappLink) {
      this.currentWhatsappLink = this.course.whatsappLink;
    }
    this.showWhatsappModal = true;
  }

  /**
   * Cierra el modal de WhatsApp
   */
  closeWhatsappModal() {
    this.showWhatsappModal = false;
    this.currentWhatsappLink = null;
  }

  /**
   * Actualiza el enlace de WhatsApp en el estado del curso
   */
  handleWhatsappLinkUpdated(Link: string) {
    if (this.course){
      this.course.whatsappLink = Link || undefined;
      this.course.hasWhatsappLink = !!Link;
    }

    // Recargar datos del curso para reflejar cambios
    this.loadCourseData();
  }
}
