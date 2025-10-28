import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../../../core/services/course.service';
import { ExerciseService, Exercise, Hint, Submission } from '../../../../core/services/exercise.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-student-course-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './student-course-view.component.html',
  styleUrls: ['./student-course-view.component.scss']
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
  isEditMode = false; // 🆕 Modo edición
  
  // 🆕 Confirmación de publicación
  showPublishConfirmModal = false;
  submissionToToggle: Submission | null = null;

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
    
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        this.course = courses.find(c => c.id === this.courseId) || null;
        
        if (!this.course) {
          this.snackBar.open('Curso no encontrado', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/student-dashboard']);
          return;
        }
        
        this.loadExercises();
        this.loadMySubmissions();
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
        
        exercises.forEach(exercise => {
          if (exercise.id) {
            this.loadHints(exercise.id);
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar ejercicios:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar ejercicios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadHints(exerciseId: number) {
    this.exerciseService.getHintsByExercise(exerciseId).subscribe({
      next: (hints) => {
        this.exerciseHints[exerciseId] = hints;
      },
      error: (error) => {
        console.error('❌ Error al cargar pistas:', error);
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

  getHints(exercise: Exercise): Hint[] {
    return exercise.id ? (this.exerciseHints[exercise.id] || []) : [];
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
        
        this.snackBar.open('✅ Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // 🆕 Descargar entrega del estudiante
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

  // 🆕 Abrir modal en modo CREACIÓN
  openUploadModal(exercise: Exercise) {
    console.log('📤 Abriendo modal para SUBIR entrega:', exercise.title);
    
    // Validar deadline
    if (exercise.deadline && new Date() > new Date(exercise.deadline)) {
      this.snackBar.open(
        '⏰ El plazo de entrega ha expirado. Ya no puedes subir este ejercicio.',
        'Cerrar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }
    
    this.selectedExercise = exercise;
    this.selectedFile = null;
    this.isEditMode = false;
    this.showUploadModal = true;
  }

  // 🆕 Abrir modal en modo EDICIÓN
  openEditModal(exercise: Exercise) {
    console.log('✏️ Abriendo modal para EDITAR entrega:', exercise.title);
    
    const submission = this.getSubmission(exercise);
    
    if (!submission) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar si puede editar
    if (!submission.canBeEdited) {
      if (submission.status === 'GRADED') {
        this.snackBar.open(
          '🚫 No puedes editar una entrega que ya fue calificada',
          'Cerrar',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
      } else {
        this.snackBar.open(
          '⏰ El plazo de entrega ha expirado. Ya no puedes editar tu trabajo.',
          'Cerrar',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
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
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:', file.name);
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  // 🆕 Método unificado para subir o editar
  submitExercise() {
    if (!this.selectedFile || !this.selectedExercise?.id || this.isSubmitting) {
      console.warn('⚠️ No se puede enviar:', { 
        hasFile: !!this.selectedFile, 
        hasExercise: !!this.selectedExercise?.id,
        isSubmitting: this.isSubmitting 
      });
      return;
    }

    this.isSubmitting = true;

    if (this.isEditMode) {
      // EDITAR entrega existente
      const submission = this.getSubmission(this.selectedExercise);
      if (!submission?.id) {
        this.snackBar.open('No se encontró la entrega', 'Cerrar', { duration: 3000 });
        this.isSubmitting = false;
        return;
      }

      console.log('✏️ Editando entrega...');
      
      this.exerciseService.updateSubmission(submission.id, this.selectedFile).subscribe({
        next: (updated) => {
          console.log('✅ Entrega actualizada:', updated);
          
          // Actualizar en la lista local
          const index = this.submissions.findIndex(s => s.id === updated.id);
          if (index !== -1) {
            this.submissions[index] = updated;
          }
          
          this.snackBar.open(
            '✅ Entrega actualizada exitosamente. Recuerda publicarla cuando esté lista.',
            'Cerrar',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
          
          this.closeUploadModal();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error al editar entrega:', error);
          this.snackBar.open(
            error.error?.error || 'Error al editar entrega',
            'Cerrar',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.isSubmitting = false;
        }
      });
    } else {
      // CREAR nueva entrega
      console.log('📤 Enviando nueva entrega...');

      this.exerciseService.submitExercise(this.selectedExercise.id, this.selectedFile).subscribe({
        next: (submission) => {
          console.log('✅ Entrega creada:', submission);
          this.submissions.push(submission);
          
          this.snackBar.open(
            '✅ Entrega subida exitosamente. Recuerda publicarla cuando esté lista.',
            'Cerrar',
            { duration: 5000, panelClass: ['success-snackbar'] }
          );
          
          this.closeUploadModal();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('❌ Error al subir entrega:', error);
          this.snackBar.open(
            error.error?.error || 'Error al subir entrega',
            'Cerrar',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  // 🆕 Abrir modal de confirmación para publicar/despublicar
  confirmTogglePublish(exercise: Exercise) {
    const submission = this.getSubmission(exercise);
    
    if (!submission) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar si está calificada
    if (submission.status === 'GRADED') {
      this.snackBar.open(
        '🚫 No puedes cambiar el estado de publicación de una entrega calificada',
        'Cerrar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    // Si intenta publicar, validar deadline
    if (!submission.published) {
      if (exercise.deadline && new Date() > new Date(exercise.deadline)) {
        this.snackBar.open(
          '⏰ El plazo de entrega ha expirado. Ya no puedes publicar tu trabajo.',
          'Cerrar',
          { duration: 4000, panelClass: ['error-snackbar'] }
        );
        return;
      }
    }

    this.submissionToToggle = submission;
    this.showPublishConfirmModal = true;
  }

  // 🆕 Ejecutar publicar/despublicar
  togglePublishSubmission() {
    if (!this.submissionToToggle?.id) return;

    const submissionId = this.submissionToToggle.id;
    const wasPublished = this.submissionToToggle.published;

    this.showPublishConfirmModal = false;

    this.exerciseService.togglePublishSubmission(submissionId).subscribe({
      next: (updated) => {
        console.log('✅ Estado de publicación actualizado:', updated);
        
        // Actualizar en la lista local
        const index = this.submissions.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.submissions[index] = updated;
        }
        
        const message = updated.published
          ? '✅ Entrega publicada. El profesor ahora puede calificarla.'
          : '📝 Entrega despublicada. El profesor ya no puede verla hasta que la publiques.';
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        
        this.submissionToToggle = null;
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado:', error);
        this.snackBar.open(
          error.error?.error || 'Error al cambiar estado de publicación',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.submissionToToggle = null;
      }
    });
  }

  cancelTogglePublish() {
    this.showPublishConfirmModal = false;
    this.submissionToToggle = null;
  }

  // 🆕 Eliminar entrega (solo si no está calificada)
  deleteSubmission(exercise: Exercise) {
    const submission = this.getSubmission(exercise);
    
    if (!submission?.id) {
      this.snackBar.open('No se encontró tu entrega', 'Cerrar', { duration: 3000 });
      return;
    }

    if (submission.status === 'GRADED') {
      this.snackBar.open(
        '🚫 No puedes eliminar una entrega que ya fue calificada',
        'Cerrar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    if (confirm('¿Estás seguro de eliminar esta entrega? Esta acción no se puede deshacer.')) {
      this.exerciseService.deleteSubmission(submission.id).subscribe({
        next: () => {
          this.submissions = this.submissions.filter(s => s.id !== submission.id);
          this.snackBar.open('✅ Entrega eliminada', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('❌ Error al eliminar:', error);
          this.snackBar.open(
            error.error?.error || 'Error al eliminar entrega',
            'Cerrar',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      });
    }
  }

  hasSubmission(exercise: Exercise): boolean {
    return this.submissions.some(s => s.exerciseId === exercise.id);
  }

  getSubmission(exercise: Exercise): Submission | undefined {
    return this.submissions.find(s => s.exerciseId === exercise.id);
  }

  getSubmissionStatusText(exercise: Exercise): string {
    const submission = this.getSubmission(exercise);
    if (!submission) return 'Pendiente';
    if (submission.status === 'GRADED') return 'Calificado';
    return 'Entregado';
  }

  // 🆕 Verificar si puede editar
  canEdit(exercise: Exercise): boolean {
    const submission = this.getSubmission(exercise);
    return submission?.canBeEdited || false;
  }

  // 🆕 Calcular días restantes
  getDaysUntilDeadline(exercise: Exercise): number | null {
    if (!exercise.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(exercise.deadline);
    
    if (now > deadline) return 0;
    
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // 🆕 Mensaje de deadline
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
      'Principiante': '#10b981',
      'Intermedio': '#f59e0b',
      'Avanzado': '#ef4444',
      'Experto': '#8b5cf6'
    };
    return colors[difficulty] || '#6b7280';
  }

  goBack() {
    this.router.navigate(['/student-dashboard']);
  }

  // 🆕 Mensaje para modal de publicación
  get publishConfirmMessage(): string {
    if (!this.submissionToToggle) return '';
    
    if (this.submissionToToggle.published) {
      return '¿Deseas despublicar esta entrega? El profesor ya no podrá verla ni calificarla hasta que la publiques nuevamente.';
    } else {
      return '¿Deseas publicar esta entrega? Una vez publicada, el profesor podrá revisarla y calificarla. No podrás editarla después de que sea calificada.';
    }
  }

  get publishConfirmTitle(): string {
    return this.submissionToToggle?.published 
      ? '📝 ¿Despublicar entrega?' 
      : '📤 ¿Publicar entrega?';
  }

  get publishConfirmButton(): string {
    return this.submissionToToggle?.published 
      ? 'Despublicar' 
      : 'Publicar';
  }
}