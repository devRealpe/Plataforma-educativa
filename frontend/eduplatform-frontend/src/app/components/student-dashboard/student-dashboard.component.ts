import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course, JoinCourseResponse } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

// Interface para cursos con progreso del estudiante
interface EnrolledCourse extends Course {
  progress: number;
  completedActivities: number;
  totalActivities: number;
  totalExercises: number;
  totalChallenges: number;
  earnedXP: number;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  // Estado
  showLogoutConfirmModal = false;
  isJoining = false;
  inviteCode = '';

  // Datos
  enrolledCourses: EnrolledCourse[] = [];
  
  stats = [
    { title: 'Cursos Activos', value: '0', icon: '📚', bgColor: '#3b82f6' },
    { title: 'XP Total', value: '0', icon: '⭐', bgColor: '#10b981' },
    { title: 'Ejercicios Completados', value: '0', icon: '✅', bgColor: '#f59e0b' },
    { title: 'Retos Superados', value: '0', icon: '🏆', bgColor: '#8b5cf6' },
  ];

  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadEnrolledCourses();
  }

  /**
   * Carga los cursos en los que el estudiante está inscrito
   */
  loadEnrolledCourses() {
    this.courseService.getEnrolledCourses().subscribe({
      next: (courses) => {
        // Aquí simulo datos de progreso. En producción vendrían del backend
        this.enrolledCourses = courses.map(course => ({
          ...course,
          progress: Math.floor(Math.random() * 100),
          completedActivities: Math.floor(Math.random() * 20),
          totalActivities: 20,
          totalExercises: Math.floor(Math.random() * 15) + 5,
          totalChallenges: Math.floor(Math.random() * 5) + 1,
          earnedXP: Math.floor(Math.random() * 500)
        }));
        
        this.updateStats();
        console.log('✅ Cursos cargados:', this.enrolledCourses);
      },
      error: (error) => {
        console.error('❌ Error al cargar cursos:', error);
        this.snackBar.open('Error al cargar tus cursos', 'Cerrar', { 
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
    this.stats[0].value = this.enrolledCourses.length.toString();
    
    const totalXP = this.enrolledCourses.reduce((sum, course) => sum + course.earnedXP, 0);
    this.stats[1].value = totalXP.toString();
    
    const totalCompleted = this.enrolledCourses.reduce((sum, course) => sum + course.completedActivities, 0);
    this.stats[2].value = totalCompleted.toString();
    
    // Simular retos completados
    const totalChallenges = this.enrolledCourses.reduce((sum, course) => 
      sum + Math.floor(course.totalChallenges * (course.progress / 100)), 0
    );
    this.stats[3].value = totalChallenges.toString();
  }

  /**
   * Une al estudiante a un curso usando el código de invitación
   */
  joinCourse() {
    const code = this.inviteCode.trim().toUpperCase();
    
    if (!code) {
      this.snackBar.open('Por favor ingresa un código', 'Cerrar', { 
        duration: 2000 
      });
      return;
    }

    this.isJoining = true;

    this.courseService.joinCourseByCode(code).subscribe({
      next: (response: JoinCourseResponse) => {
        console.log('✅ Respuesta completa del servidor:', response);
        
        // Extraer el curso de la respuesta
        const course = response.course;
        
        console.log('✅ Curso extraído:', course);
        
        // Validar que el curso tenga los datos necesarios
        if (!course || !course.id || !course.title || !course.description) {
          console.error('❌ Curso sin datos completos:', course);
          console.warn('⚠️ Recargando lista de cursos...');
          
          // Si los datos no están completos, recargar la lista
          this.loadEnrolledCourses();
          this.inviteCode = '';
          this.isJoining = false;
          
          this.snackBar.open(
            '¡Te has unido al curso exitosamente!',
            'Cerrar',
            { 
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          );
          return;
        }
        
        // Verificar si el curso ya existe en la lista (por si acaso)
        const courseExists = this.enrolledCourses.some(c => c.id === course.id);
        
        if (courseExists) {
          console.warn('⚠️ El curso ya existe en la lista');
          this.inviteCode = '';
          this.isJoining = false;
          
          this.snackBar.open(
            'Ya estás inscrito en este curso',
            'Cerrar',
            { duration: 3000 }
          );
          return;
        }
        
        // Agregar el curso a la lista local con datos iniciales de progreso
        const enrolledCourse: EnrolledCourse = {
          id: course.id,
          title: course.title,
          description: course.description,
          level: course.level,
          inviteCode: course.inviteCode,
          progress: 0,
          completedActivities: 0,
          totalActivities: 20,
          totalExercises: 0,
          totalChallenges: 0,
          earnedXP: 0
        };
        
        console.log('✅ Curso formateado para agregar:', enrolledCourse);
        
        // Agregar al inicio de la lista para que sea visible inmediatamente
        this.enrolledCourses.unshift(enrolledCourse);
        this.updateStats();
        
        // Limpiar el input
        this.inviteCode = '';
        this.isJoining = false;
        
        // Mostrar notificación de éxito
        this.snackBar.open(
          `¡Bienvenido al curso "${course.title}"!`,
          'Cerrar',
          { 
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        console.error('❌ Error completo:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error body:', error.error);
        
        this.isJoining = false;
        
        let errorMessage = 'No se pudo unir al curso';
        
        if (error.status === 404) {
          errorMessage = 'Código inválido. Verifica con tu profesor';
        } else if (error.status === 400) {
          // Extraer mensaje de error del backend
          const backendError = error.error?.error || error.error?.message;
          if (backendError?.includes('Ya estás inscrito')) {
            errorMessage = 'Ya estás inscrito en este curso';
          } else if (backendError?.includes('Solo los estudiantes')) {
            errorMessage = 'Solo los estudiantes pueden unirse a cursos';
          } else if (backendError) {
            errorMessage = backendError;
          }
        } else if (error.status === 409) {
          errorMessage = 'Ya estás inscrito en este curso';
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      },
    });
  }

  /**
   * Retorna el color del progreso según el porcentaje
   */
  getProgressColor(progress: number): string {
    if (progress < 30) return 'linear-gradient(to bottom, #ef4444, #dc2626)';
    if (progress < 70) return 'linear-gradient(to bottom, #f59e0b, #d97706)';
    return 'linear-gradient(to bottom, #10b981, #059669)';
  }

  /**
   * Navega al contenido del curso
   */
  enterCourse(course: EnrolledCourse) {
    console.log('📖 Entrando al curso:', course.title);
    // Aquí navegarías a la vista del curso
    // this.router.navigate(['/course', course.id]);
    this.snackBar.open(
      `Entrando a ${course.title}...`,
      'Cerrar',
      { duration: 2000 }
    );
  }

  /**
   * Muestra el progreso detallado del curso
   */
  viewProgress(course: EnrolledCourse) {
    console.log('📊 Viendo progreso de:', course.title);
    // Aquí navegarías a la vista de progreso
    // this.router.navigate(['/progress', course.id]);
    this.snackBar.open(
      `Cargando progreso de ${course.title}...`,
      'Cerrar',
      { duration: 2000 }
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