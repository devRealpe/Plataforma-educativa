import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService, Course } from '../../services/course.service';
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
      next: (course) => {
        console.log('✅ Unido al curso:', course);
        
        // Agregar el curso a la lista local con datos iniciales
        const enrolledCourse: EnrolledCourse = {
          ...course,
          progress: 0,
          completedActivities: 0,
          totalActivities: 20,
          totalExercises: 0,
          totalChallenges: 0,
          earnedXP: 0
        };
        
        this.enrolledCourses.push(enrolledCourse);
        this.updateStats();
        
        // Limpiar el input
        this.inviteCode = '';
        this.isJoining = false;
        
        // Mostrar notificación de éxito
        this.snackBar.open(
          `¡Bienvenido al curso "${course.title}"! 🎉`,
          'Cerrar',
          { 
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        console.error('❌ Error al unirse al curso:', error);
        this.isJoining = false;
        
        let errorMessage = 'No se pudo unir al curso';
        
        if (error.status === 404) {
          errorMessage = 'Código inválido. Verifica con tu profesor';
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