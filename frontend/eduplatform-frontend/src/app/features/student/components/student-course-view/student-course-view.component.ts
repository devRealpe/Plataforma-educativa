import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CourseService,
  Course,
} from '../../../../core/services/course.service';
import {
  ExerciseService,
  Exercise,
  Hint,
  Submission,
} from '../../../../core/services/exercise.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { PodiumComponent } from '../../../../shared/components/podium/podium.component';
import { ChallengesViewComponent } from '../challenges-view/challenges-view.component';

@Component({
  selector: 'app-student-course-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PodiumComponent,
    ChallengesViewComponent,
    ConfirmationModalComponent,
  ],
  templateUrl: './student-course-view.component.html',
  styleUrls: ['./student-course-view.component.scss'],
})
export class StudentCourseViewComponent implements OnInit {
  courseId!: number;
  course: Course | null = null;
  exercises: Exercise[] = [];
  submissions: Submission[] = [];
  exerciseHints: { [key: number]: Hint[] } = {};

  isLoading = true;
  showHints: { [key: number]: boolean } = {};

  // Upload/Edit modal
  showUploadModal = false;
  selectedExercise: Exercise | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  isEditMode = false;

  // Delete confirmation modal
  showDeleteModal = false;
  exerciseToDelete: Exercise | null = null;
  submissionToDelete: Submission | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private exerciseService: ExerciseService,
    private snackBar: MatSnackBar
  ) {}

  // Tab Navigation
  activeTab: 'exercises' | 'challenges' | 'podium' = 'exercises';

  /**
   * Inicia el proceso de eliminación de una entrega
   */
  deleteSubmission(exercise: Exercise) {
    const submission = this.getSubmission(exercise);

    if (!submission?.id) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (submission.status === 'GRADED') {
      this.snackBar.open(
        '🚫 No puedes eliminar una entrega calificada',
        'Cerrar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    this.exerciseToDelete = exercise;
    this.submissionToDelete = submission;
    this.showDeleteModal = true;
  }

  /**
   * Confirma la eliminación de la entrega
   */
  confirmDeleteSubmission() {
    if (!this.submissionToDelete?.id) return;

    const submissionId = this.submissionToDelete.id;
    const exerciseTitle = this.exerciseToDelete?.title || 'el ejercicio';

    this.showDeleteModal = false;

    this.exerciseService.deleteSubmission(submissionId).subscribe({
      next: () => {
        // Eliminar de la lista local
        this.submissions = this.submissions.filter(
          (s) => s.id !== submissionId
        );

        this.snackBar.open(
          `✅ Entrega de "${exerciseTitle}" eliminada`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        this.exerciseToDelete = null;
        this.submissionToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar entrega:', error);
        this.snackBar.open(
          error.error?.error || 'Error al eliminar la entrega',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );

        this.exerciseToDelete = null;
        this.submissionToDelete = null;
      },
    });
  }

  /**
   * Cancela la eliminación de la entrega
   */
  cancelDeleteSubmission() {
    this.showDeleteModal = false;
    this.exerciseToDelete = null;
    this.submissionToDelete = null;
  }

  /**
   * Genera el mensaje para el modal de confirmación
   */
  getDeleteSubmissionMessage(): string {
    return `¿Estás seguro de que deseas eliminar tu entrega para "${
      this.exerciseToDelete?.title || 'este ejercicio'
    }"?\n\nEsta acción no se puede deshacer.`;
  }

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCourseData();
  }

  loadCourseData() {
    this.isLoading = true;

    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        this.course = courses.find((c) => c.id === this.courseId) || null;

        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/student-dashboard']);
          return;
        }

        this.loadExercises();
        this.loadMySubmissions();
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

        exercises.forEach((exercise) => {
          if (exercise.id) {
            this.loadHints(exercise.id);
          }
        });
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

  loadHints(exerciseId: number) {
    this.exerciseService.getHintsByExercise(exerciseId).subscribe({
      next: (hints) => {
        this.exerciseHints[exerciseId] = hints;
      },
      error: (error) => {
        console.error('❌ Error al cargar pistas:', error);
      },
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
      },
    });
  }

  getHints(exercise: Exercise): Hint[] {
    return exercise.id ? this.exerciseHints[exercise.id] || [] : [];
  }

  toggleHints(exerciseId: number) {
    this.showHints[exerciseId] = !this.showHints[exerciseId];
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

        this.snackBar.open('✅ Tu entrega descargada', 'Cerrar', {
          duration: 2000,
        });
      },
      error: (error) => {
        console.error('❌ Error al descargar entrega:', error);
        this.snackBar.open('Error al descargar tu entrega', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  openUploadModal(exercise: Exercise) {
    console.log('📤 Abriendo modal para SUBIR entrega:', exercise.title);

    if (exercise.deadline && new Date() > new Date(exercise.deadline)) {
      this.snackBar.open('⏰ El plazo de entrega ha expirado', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    this.selectedExercise = exercise;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showUploadModal = true;
  }

  openEditModal(exercise: Exercise) {
    console.log('✏️ Abriendo modal para EDITAR entrega:', exercise.title);

    const submission = this.getSubmission(exercise);

    if (!submission) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (!submission.canBeEdited) {
      if (submission.status === 'GRADED') {
        this.snackBar.open(
          '🚫 No puedes editar una entrega calificada',
          'Cerrar',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      } else {
        this.snackBar.open('⏰ El plazo de entrega ha expirado', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar'],
        });
      }
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
          duration: 3000,
        });
        return;
      }
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:', file.name);
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
          duration: 3000,
        });
        this.isSubmitting = false;
        return;
      }

      this.exerciseService
        .updateSubmission(submission.id, this.selectedFile)
        .subscribe({
          next: (updated) => {
            this.loadMySubmissions();
            const index = this.submissions.findIndex(
              (s) => s.id === updated.id
            );
            if (index !== -1) {
              this.submissions[index] = updated;
            }

            this.snackBar.open(
              '✅ Entrega actualizada exitosamente',
              'Cerrar',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );

            this.closeUploadModal();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('❌ Error al editar:', error);
            this.snackBar.open(
              error.error?.error || 'Error al editar entrega',
              'Cerrar',
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
            this.isSubmitting = false;
          },
        });
    } else {
      // CREAR
      this.exerciseService
        .submitExercise(this.selectedExercise.id, this.selectedFile)
        .subscribe({
          next: (submission) => {
            this.loadMySubmissions();

            this.snackBar.open(
              '✅ Entrega subida exitosamente. El profesor ya puede verla.',
              'Cerrar',
              { duration: 4000, panelClass: ['success-snackbar'] }
            );

            this.closeUploadModal();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('❌ Error al subir:', error);
            this.snackBar.open(
              error.error?.error || 'Error al subir entrega',
              'Cerrar',
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
            this.isSubmitting = false;
          },
        });
    }
  }

  hasSubmission(exercise: Exercise): boolean {
    return this.submissions.some((s) => s.exerciseId === exercise.id);
  }

  getSubmission(exercise: Exercise): Submission | undefined {
    return this.submissions.find((s) => s.exerciseId === exercise.id);
  }

  getSubmissionStatusText(exercise: Exercise): string {
    const submission = this.getSubmission(exercise);
    if (!submission) return 'Pendiente';
    if (submission.status === 'GRADED') return 'Calificado';
    return 'Entregado';
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

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      Principiante: '#10b981',
      Intermedio: '#f59e0b',
      Avanzado: '#ef4444',
      Experto: '#8b5cf6',
    };
    return colors[difficulty] || '#6b7280';
  }

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }

  setActiveTab(tab: 'exercises' | 'challenges' | 'podium') {
    this.activeTab = tab;
  }

  // ========== NUEVO MÉTODO: Abrir URL Externa ==========
  openExternalUrl(url: string) {
    if (!url) {
      this.snackBar.open('❌ No hay URL disponible', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // Validar que la URL sea válida
    try {
      const urlObj = new URL(url);

      // Abrir en nueva pestaña con seguridad
      window.open(url, '_blank', 'noopener,noreferrer');

      this.snackBar.open('🔗 Abriendo enlace externo...', '', {
        duration: 2000,
        panelClass: ['success-snackbar'],
      });

      console.log('✅ Abriendo URL:', url);
    } catch (error) {
      console.error('❌ URL inválida:', url, error);
      this.snackBar.open('❌ URL inválida', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
    }
  }
}
