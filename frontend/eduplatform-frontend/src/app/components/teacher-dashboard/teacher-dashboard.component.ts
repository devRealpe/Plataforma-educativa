import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { CourseModalComponent } from '../course-modal/course-modal.component';
import { EditCourseModalComponent } from '../edit-course-modal/edit-course-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CourseModalComponent, 
    EditCourseModalComponent,
    ConfirmationModalComponent
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
  courseToEdit: Course | null = null;
  courseToDelete: Course | null = null;

  // Datos
  courses: Course[] = [];
  
  stats = [
    { title: 'Total Cursos', value: '0', icon: '📚', bgColor: '#3b82f6' },
    { title: 'Estudiantes', value: '0', icon: '👥', bgColor: '#10b981' },
    { title: 'Ejercicios', value: '0', icon: '✏️', bgColor: '#f59e0b' },
    { title: 'Retos', value: '0', icon: '🏆', bgColor: '#8b5cf6' },
  ];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  /**
   * Carga todos los cursos del profesor
   */
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

  /**
   * Actualiza las estadísticas del dashboard
   */
  updateStats() {
    this.stats[0].value = this.courses.length.toString();
    
    // Aquí puedes agregar más lógica para actualizar otras estadísticas
    // Por ejemplo, contar estudiantes totales, ejercicios, etc.
  }

  /**
   * Abre el modal para CREAR un nuevo curso
   */
  openModal() {
    this.showCreateModal = true;
  }

  /**
   * Cierra el modal de crear
   */
  closeModal() {
    this.showCreateModal = false;
  }

  /**
   * Maneja la creación exitosa de un curso
   */
  handleCourseCreated(course: Course) {
    console.log('✅ Curso creado exitosamente:', course);
    
    // Agregar el curso a la lista local
    this.courses.push(course);
    this.updateStats();
    
    // Cerrar el modal
    this.closeModal();
    
    // Mostrar notificación de éxito
    this.snackBar.open(
      `✅ Curso "${course.title}" creado exitosamente. Código: ${course.inviteCode}`,
      'Cerrar',
      { 
        duration: 5000,
        panelClass: ['success-snackbar']
      }
    );
  }

  /**
   * Abre el modal para EDITAR un curso existente
   */
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

  /**
   * Cierra el modal de editar
   */
  closeEditModal() {
    this.showEditModal = false;
    this.courseToEdit = null;
  }

  /**
   * Maneja la actualización exitosa de un curso
   */
  handleCourseUpdated(updatedCourse: Course) {
    console.log('✅ Curso actualizado:', updatedCourse);
    
    // Actualizar el curso en la lista local
    const index = this.courses.findIndex(c => c.id === updatedCourse.id);
    if (index !== -1) {
      this.courses[index] = updatedCourse;
    }
    
    // Cerrar el modal
    this.closeEditModal();
    
    // Mostrar notificación de éxito
    this.snackBar.open(
      `✅ Curso "${updatedCourse.title}" actualizado exitosamente`,
      'Cerrar',
      { 
        duration: 3000,
        panelClass: ['success-snackbar']
      }
    );
  }
deleteMessage: string = '';
  /**
   * Muestra el modal de confirmación para eliminar curso
   */
  deleteCourse(course: Course) {
    if (!course.id) {
      this.snackBar.open('❌ Error: el curso no tiene ID', 'Cerrar', { 
        duration: 3000 
      });
      return;
    }

    this.courseToDelete = course;
    this.showDeleteConfirmModal = true;
  }

  /**
   * Confirma y ejecuta la eliminación del curso
   */
  confirmDeleteCourse() {
    if (!this.courseToDelete?.id) return;

    const courseTitle = this.courseToDelete.title;
    const courseId = this.courseToDelete.id;

    // Cerrar modal
    this.showDeleteConfirmModal = false;

    // Mostrar mensaje de carga
    this.snackBar.open('🗑️ Eliminando curso...', '', { duration: 2000 });

    this.courseService.deleteCourse(courseId).subscribe({
      next: () => {
        console.log('✅ Curso eliminado:', courseTitle);
        
        // Remover el curso de la lista local
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.updateStats();
        
        // Limpiar referencia
        this.courseToDelete = null;
        
        // Mostrar notificación de éxito
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

  /**
   * Cancela la eliminación del curso
   */
  cancelDeleteCourse() {
    this.showDeleteConfirmModal = false;
    this.courseToDelete = null;
  }

  /**
   * Copia el código de invitación al portapapeles
   */
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

  /**
   * Muestra el modal de confirmación para cerrar sesión
   */
  logout() {
    this.showLogoutConfirmModal = true;
  }

  /**
   * Confirma y ejecuta el cierre de sesión
   */
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

  /**
   * Cancela el cierre de sesión
   */
  cancelLogout() {
    this.showLogoutConfirmModal = false;
  }

  /**
   * Navega a la vista de perfil
   */
  goToProfile() {
    this.router.navigate(['/profile']);
  }
}