import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services
import { CourseService, Course } from '../../../../../../core/services/course.service';
import { ExerciseService, Exercise, Submission } from '../../../../../../core/services/exercise.service';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../../../../core/services/challenge.service';

// Modales
import { ConfirmationModalComponent } from '../../../../../../shared/components/confirmation-modal/confirmation-modal.component';

// Componentes
import { PodiumComponent } from '../../../../../../shared/components/podium/podium.component';
import { ExerciseListComponent } from '../exercise-list/exercise-list.component';
import { ChallengeListComponent } from '../challenge-list/challenge-list.component';

// 🆕 WhatsApp Button Component - IMPORTANTE: Verificar que esté correctamente importado
import { WhatsappButtonComponent } from '../../../../components/whatsapp-button/whatsapp-button.component';

/**
 * 🎯 ORQUESTADOR PRINCIPAL DE COURSE DETAIL - STUDENT
 * 
 * Este componente actúa como:
 * - Contenedor principal de la vista de detalle del curso
 * - Coordinador de todos los componentes hijos
 * - Gestor del estado global (curso, ejercicios, retos)
 * - Controlador de modales
 * - Router principal de la sección
 */
@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    PodiumComponent,
    ExerciseListComponent,
    ChallengeListComponent,
    WhatsappButtonComponent // ✅ CRÍTICO: Debe estar aquí
  ],
  templateUrl: './course-header.component.html',
  styleUrls: ['./course-header.component.scss']
})
export class CourseHeaderComponentStudent implements OnInit {
  // ==========================================
  // ESTADO DEL CURSO
  // ==========================================
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  challenges: Challenge[] = [];
  submissions: Submission[] = [];
  challengeSubmissions: ChallengeSubmission[] = [];
  
  isLoading = true;
  isLoadingChallenges = false;

  // ==========================================
  // ESTADO DE MODALES
  // ==========================================
  showUploadModal = false;
  showDeleteModal = false;
  showDeleteChallengeSubmissionModal = false;
  
  selectedExercise: Exercise | null = null;
  exerciseToDelete: Exercise | null = null;
  submissionToDelete: Submission | null = null;
  
  selectedChallenge: Challenge | null = null;
  challengeSubmissionToDelete: ChallengeSubmission | null = null;
  
  selectedFile: File | null = null;
  isSubmitting = false;
  isEditMode = false;

  // ==========================================
  // NAVEGACIÓN
  // ==========================================
  activeTab: 'exercises' | 'challenges' | 'podium' = 'exercises';

  // ==========================================
  // GETTERS
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
      this.router.navigate(['/student-dashboard']);
      return;
    }

    console.log('🚀 Inicializando Course Header (STUDENT) con ID:', this.courseId);
    this.loadCourseData();
  }

  // ==========================================
  // 📊 CARGA DE DATOS
  // ==========================================

  loadCourseData() {
    this.isLoading = true;
    
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        this.course = courses.find(c => c.id === this.courseId) || null;
        
        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/student-dashboard']);
          return;
        }
        
        console.log('✅ Curso cargado:', this.course.title);
        console.log('🔍 WhatsApp Link:', this.course.whatsappLink || 'No configurado');
        
        this.loadExercises();
        this.loadChallenges();
        this.loadMySubmissions();
        this.loadMyChallengeSubmissions();
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
        console.log(`✅ ${exercises.length} ejercicios cargados`);
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', { duration: 3000 });
      }
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
      }
    });
  }

  loadMySubmissions() {
    this.exerciseService.getMySubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        console.log('✅ Mis entregas cargadas:', submissions);
      },
      error: (error) => {
        console.error('❌ Error al cargar entregas:', error);
      }
    });
  }

  loadMyChallengeSubmissions() {
    this.challengeService.getMyChallengeSubmissions().subscribe({
      next: (submissions) => {
        this.challengeSubmissions = submissions;
        console.log('✅ Mis soluciones de retos cargadas:', submissions);
      },
      error: (error) => {
        console.error('❌ Error al cargar soluciones:', error);
      }
    });
  }

  // ==========================================
  // 🔄 NAVEGACIÓN
  // ==========================================

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }

  onTabChange(tab: 'exercises' | 'challenges' | 'podium') {
    this.activeTab = tab;
    console.log('📑 Tab cambiado a:', tab);
  }

  // ==========================================
  // 📝 GESTIÓN DE EJERCICIOS
  // ==========================================

  openUploadModal(exercise: Exercise) {
    if (exercise.deadline && new Date() > new Date(exercise.deadline)) {
      this.snackBar.open('⏰ El plazo de entrega ha expirado', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.selectedExercise = exercise;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showUploadModal = true;
  }

  openEditModal(exercise: Exercise, submission: Submission) {
    if (!submission.canBeEdited) {
      const reason = submission.status === 'GRADED' 
        ? 'ya fue calificada' 
        : 'plazo expirado';
      this.snackBar.open(`🚫 No puedes editar: ${reason}`, 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.selectedExercise = exercise;
    this.selectedFile = null;
    this.isEditMode = true;
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedExercise = null;
    this.selectedFile = null;
    this.isEditMode = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', {
          duration: 3000
        });
        return;
      }
      this.selectedFile = file;
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  submitExercise() {
    if (!this.selectedFile || !this.selectedExercise?.id || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      // EDITAR
      const submission = this.getSubmission(this.selectedExercise);
      if (!submission?.id) {
        this.snackBar.open('No se encontró la entrega', 'Cerrar', {
          duration: 3000
        });
        this.isSubmitting = false;
        return;
      }

      this.exerciseService.updateSubmission(submission.id, this.selectedFile).subscribe({
        next: (updated) => {
          this.loadMySubmissions();
          this.snackBar.open('✅ Entrega actualizada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.closeUploadModal();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error al editar:', error);
          this.snackBar.open(error.error?.error || 'Error al editar entrega', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    } else {
      // CREAR
      this.exerciseService.submitExercise(this.selectedExercise.id, this.selectedFile).subscribe({
        next: (submission) => {
          this.loadMySubmissions();
          this.snackBar.open('✅ Entrega subida exitosamente', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          this.closeUploadModal();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error al subir:', error);
          this.snackBar.open(error.error?.error || 'Error al subir entrega', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteSubmission(exercise: Exercise) {
    const submission = this.getSubmission(exercise);
    
    if (!submission) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', { duration: 3000 });
      return;
    }

    if (submission.status === 'GRADED') {
      this.snackBar.open('🚫 No puedes eliminar una entrega calificada', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.exerciseToDelete = exercise;
    this.submissionToDelete = submission;
    this.showDeleteModal = true;
  }

  confirmDeleteSubmission() {
    if (!this.submissionToDelete?.id) return;

    const submissionId = this.submissionToDelete.id;
    const exerciseTitle = this.exerciseToDelete?.title || 'el ejercicio';

    this.showDeleteModal = false;

    this.exerciseService.deleteSubmission(submissionId).subscribe({
      next: () => {
        this.loadMySubmissions();
        this.snackBar.open(`✅ Entrega de "${exerciseTitle}" eliminada`, 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.exerciseToDelete = null;
        this.submissionToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar entrega:', error);
        this.snackBar.open(error.error?.error || 'Error al eliminar la entrega', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.exerciseToDelete = null;
        this.submissionToDelete = null;
      }
    });
  }

  cancelDeleteSubmission() {
    this.showDeleteModal = false;
    this.exerciseToDelete = null;
    this.submissionToDelete = null;
  }

  getSubmission(exercise: Exercise): Submission | undefined {
    return this.submissions.find(s => s.exerciseId === exercise.id);
  }

  hasSubmission(exercise: Exercise): boolean {
    return !!this.getSubmission(exercise);
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
        
        this.snackBar.open('✅ Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  downloadSubmission(submission: Submission) {
    if (!submission.id) return;

    this.exerciseService.downloadSubmission(submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'mi_entrega.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('✅ Tu entrega descargada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error al descargar entrega:', error);
        this.snackBar.open('Error al descargar tu entrega', 'Cerrar', { duration: 3000 });
      }
    });
  }

  downloadChallenge(challenge: Challenge) {
    if (!challenge.id) return;

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
        
        this.snackBar.open('📥 Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al descargar:', error);
        this.snackBar.open('Error al descargar el archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  downloadChallengeSubmission(submission: ChallengeSubmission) {
    if (!submission.id) return;

    this.challengeService.downloadChallengeSubmission(submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'mi_solucion.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('📥 Tu solución descargada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al descargar solución:', error);
        this.snackBar.open('Error al descargar tu solución', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ==========================================
  // 🔗 URLs EXTERNAS
  // ==========================================

  openExternalUrl(url: string) {
    if (!url) {
      this.snackBar.open('❌ No hay URL disponible', 'Cerrar', { duration: 3000 });
      return;
    }
    
    try {
      new URL(url);
      window.open(url, '_blank', 'noopener,noreferrer');
      this.snackBar.open('🔗 Abriendo enlace externo...', '', { 
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('❌ URL inválida:', url, error);
      this.snackBar.open('❌ URL inválida', 'Cerrar', { 
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // ==========================================
  // 🛠️ UTILIDADES
  // ==========================================

  getDeleteSubmissionMessage(): string {
    return `¿Estás seguro de que deseas eliminar tu entrega para "${this.exerciseToDelete?.title || 'este ejercicio'}"?\n\nEsta acción no se puede deshacer.`;
  }
}