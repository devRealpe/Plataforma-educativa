import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ AGREGADO
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../../../core/services/course.service';
import { ExerciseService, Exercise, Hint, Submission } from '../../../../core/services/exercise.service';

@Component({
  selector: 'app-student-course-view',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ AGREGADO FormsModule
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
  
  // Upload modal
  showUploadModal = false;
  selectedExercise: Exercise | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

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

  openUploadModal(exercise: Exercise) {
    console.log('📤 Abriendo modal para subir entrega:', exercise.title);
    this.selectedExercise = exercise;
    this.selectedFile = null; // Reset file
    this.showUploadModal = true;
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedExercise = null;
    this.selectedFile = null;
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
    console.log('📤 Enviando entrega...');

    this.exerciseService.submitExercise(this.selectedExercise.id, this.selectedFile).subscribe({
      next: (submission) => {
        console.log('✅ Entrega enviada exitosamente:', submission);
        this.submissions.push(submission);
        this.snackBar.open('✅ Entrega subida exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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
}