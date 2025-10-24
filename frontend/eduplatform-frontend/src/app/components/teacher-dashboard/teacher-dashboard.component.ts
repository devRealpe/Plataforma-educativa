import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { CourseModalComponent } from '../course-modal/course-modal.component';
import { EditCourseModalComponent } from '../edit-course-modal/edit-course-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { ManageStudentsModalComponent } from '../manage-students-modal/manage-students-modal.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CourseModalComponent, 
    EditCourseModalComponent,
    ConfirmationModalComponent,
    ManageStudentsModalComponent
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss'],
})
export class TeacherDashboardComponent implements OnInit {
  // Estado de los modales
  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirmModal = false;
  showLogoutConfirmModal = false;
  showStudentsModal = false;
  
  courseToEdit: Course | null = null;
  courseToDelete: Course | null = null;
  selectedCourse: Course | null = null;

  // Datos
  courses: Course[] = [];
  
  stats = [
    { title: 'Total Cursos', value: '0', icon: '📚', bgColor: '#3b82f6' },
    { title: 'Estudiantes', value: '0', icon: '👥', bgColor: '#10b981' },
    { title: 'Ejercicios', value: '0', icon: '✏️', bgColor: '#f59e0b' },
    { title: 'Retos', value: '0', icon: '🏆', bgColor: '#8b5cf6' },
  ];

  deleteMessage = '';

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getMyCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.updateStats();
        console.log('✅ Cursos cargados:', courses);
      },
      error: (error) => {
        console.error('❌ Error al cargar cursos:', error);
        this.snackBar.open('Error al cargar cursos', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  updateStats() {
    this.stats[0].value = this.courses.length.toString();

    const totalStudents = this.courses.reduce(
      (sum, course) => sum + (course.studentCount || 0),
      0
    );
    this.stats[1].value = totalStudents.toString();

    const totalExercises = 0;
    this.stats[2].value = totalExercises.toString();

    const totalChallenges = 0;
    this.stats[3].value = totalChallenges.toString();
  }

  openModal() {
    this.showCreateModal = true;
  }

  closeModal() {
    this.showCreateModal = false;
  }

  handleCourseCreated(course: Course) {
    console.log('✅ Curso creado exitosamente:', course);
    
    this.courses.push(course);
    this.updateStats();
    
    this.closeModal();
    
    this.snackBar.open(
      `✅ Curso "${course.title}" creado exitosamente. Código: ${course.inviteCode}`,
      'Cerrar',
      { 
        duration: 5000,
        panelClass: ['success-snackbar']
      }
    );
  }

  editCourse(course: Course) {
    if (!course.id) {
      this.snackBar.open('❌ Error: el curso no tiene ID', 'Cerrar', { 
        duration: 3000 
      });
      return;
    }

    this.courseToEdit = course;
    this.showEditModal = true;
    
    console.log('📝 Editando curso:', course);
  }

  closeEditModal() {
    this.showEditModal = false;
    this.courseToEdit = null;
  }

  handleCourseUpdated(updatedCourse: Course) {
    console.log('✅ Curso actualizado:', updatedCourse);
    
    const index = this.courses.findIndex(c => c.id === updatedCourse.id);
    if (index !== -1) {
      this.courses[index] = updatedCourse;
    }
    
    this.closeEditModal();
    
    this.snackBar.open(
      `✅ Curso "${updatedCourse.title}" actualizado exitosamente`,
      'Cerrar',
      { 
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );
  }

  deleteCourse(course: Course) {
    if (!course.id) {
      this.snackBar.open('❌ Error: el curso no tiene ID', 'Cerrar', { 
        duration: 3000 
      });
      return;
    }

    this.courseToDelete = course;
    this.deleteMessage = `¿Estás seguro de que deseas eliminar el curso "${course.title}"?\n\nEsta acción eliminará:\n• El curso y toda su información\n• Todos los ejercicios asociados\n• Todas las entregas de estudiantes\n\nEsta acción no se puede deshacer.`;
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteCourse() {
    if (!this.courseToDelete?.id) return;

    const courseTitle = this.courseToDelete.title;
    const courseId = this.courseToDelete.id;

    this.showDeleteConfirmModal = false;

    this.snackBar.open('🗑️ Eliminando curso...', '', { duration: 2000 });

    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        console.log('✅ Curso eliminado:', courseTitle);
        
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.updateStats();
        
        this.courseToDelete = null;
        
        this.snackBar.open(
          `✅ Curso "${courseTitle}" eliminado exitosamente`,
          'Cerrar',
          { 
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        console.error('❌ Error al eliminar curso:', error);
        this.courseToDelete = null;
        
        this.snackBar.open(
          '❌ Error al eliminar el curso. Por favor intenta de nuevo.',
          'Cerrar',
          { 
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      },
    });
  }

  cancelDeleteCourse() {
    this.showDeleteConfirmModal = false;
    this.courseToDelete = null;
  }

  enterCourse(course: Course) {
    if (!course.id) {
      this.snackBar.open('❌ Error: el curso no tiene ID', 'Cerrar', { 
        duration: 3000 
      });
      return;
    }

    this.router.navigate(['/course', course.id]);
  }

  manageStudents(course: Course) {
    this.selectedCourse = course;
    this.showStudentsModal = true;
  }

  closeStudentsModal() {
    this.showStudentsModal = false;
    this.selectedCourse = null;
    this.loadCourses(); // Refrescar lista tras gestionar estudiantes
  }

  copyToClipboard(code: string) {
    if (!code) {
      this.snackBar.open('❌ Código no disponible', 'Cerrar', { 
        duration: 2000 
      });
      return;
    }

    navigator.clipboard.writeText(code).then(
      () => {
        this.snackBar.open(
          `✅ Código "${code}" copiado al portapapeles`,
          'Cerrar',
          { 
            duration: 2000,
            panelClass: ['success-snackbar']
          }
        );
        console.log('📋 Código copiado:', code);
      },
      (error) => {
        console.error('❌ Error al copiar:', error);
        this.snackBar.open(
          '❌ Error al copiar el código',
          'Cerrar',
          { duration: 2000 }
        );
      }
    );
  }

  logout() {
    this.showLogoutConfirmModal = true;
  }

  confirmLogout() {
    this.showLogoutConfirmModal = false;
    
    this.authService.logout();
    this.snackBar.open(
      '👋 Sesión cerrada correctamente',
      'Cerrar',
      { duration: 2000 }
    );
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutConfirmModal = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
