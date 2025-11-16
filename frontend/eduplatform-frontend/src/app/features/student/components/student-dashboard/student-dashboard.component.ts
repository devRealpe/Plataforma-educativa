import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { CourseService, Course, JoinCourseResponse } from '../../../../core/services/course.service';
import { StatsService, StudentStats, CourseProgress } from '../../../../core/services/stats.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

interface EnrolledCourse extends Course {
  progress: number;
  completedActivities: number;
  totalActivities: number;
  totalExercises: number;
  totalChallenges: number;
  earnedXP: number;
}

interface StatCard {
  title: string;
  value: string;
  icon: string;
  bgGradient: string;
  textColor: string;
  isLoading?: boolean;
  bgColor?: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss'],
})
export class StudentDashboardComponent implements OnInit {
  showLogoutConfirmModal = false;
  isJoining = false;
  inviteCode = '';
  isLoadingStats = true;

  enrolledCourses: EnrolledCourse[] = [];
  courseToLeave: Course | null = null;
  showLeaveConfirmModal = false;
  
  stats: StatCard[] = [
    { 
      title: 'Cursos Activos', 
      value: '0', 
      icon: '📚', 
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff',
      isLoading: true
    },
    { 
      title: 'XP Total', 
      value: '0', 
      icon: '⭐', 
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      textColor: '#ffffff',
      isLoading: true
    },
    { 
      title: 'Ejercicios Completados', 
      value: '0', 
      icon: '✅', 
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      textColor: '#ffffff',
      isLoading: true
    },
    { 
      title: 'Retos Superados', 
      value: '0', 
      icon: '🏆', 
      bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      textColor: '#ffffff',
      isLoading: true
    }
  ];

  constructor(
    private courseService: CourseService,
    private statsService: StatsService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  /**
   * ✅ Cargar datos del dashboard: estadísticas generales y cursos con progreso
   */
  loadDashboardData() {
    this.isLoadingStats = true;

    forkJoin({
      stats: this.statsService.getStudentStats(),
      courses: this.courseService.getEnrolledCourses()
    }).subscribe({
      next: ({ stats, courses }) => {
        this.updateStatsFromAPI(stats);
        this.loadCoursesWithProgress(courses);
        this.isLoadingStats = false;
        
        console.log('✅ Dashboard cargado:', { stats, courses });
      },
      error: (error) => {
        console.error('❌ Error al cargar dashboard:', error);
        this.isLoadingStats = false;
        
        this.snackBar.open('Error al cargar el dashboard', 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * ✅ Actualizar estadísticas generales desde la API
   */
  updateStatsFromAPI(stats: StudentStats) {
    this.stats[0].value = stats.enrolledCourses.toString();
    this.stats[0].isLoading = false;

    this.stats[1].value = stats.totalXP.toString();
    this.stats[1].isLoading = false;

    this.stats[2].value = stats.completedExercises.toString();
    this.stats[2].isLoading = false;

    this.stats[3].value = stats.completedChallenges.toString();
    this.stats[3].isLoading = false;
  }

  /**
   * ✅ Cargar cursos con progreso individual desde la API
   */
  loadCoursesWithProgress(courses: Course[]) {
    if (courses.length === 0) {
      this.enrolledCourses = [];
      return;
    }

    const progressRequests = courses.map(course => 
      this.statsService.getCourseProgress(course.id!)
    );

    forkJoin(progressRequests).subscribe({
      next: (progressList: CourseProgress[]) => {
        this.enrolledCourses = courses.map((course, index) => {
          const progress = progressList[index];
          
          return {
            ...course,
            progress: progress.progressPercentage,
            completedActivities: progress.completedActivities,
            totalActivities: progress.totalActivities,
            totalExercises: progress.totalExercises,
            totalChallenges: progress.totalChallenges,
            earnedXP: progress.earnedXP
          };
        });

        console.log('✅ Cursos con progreso:', this.enrolledCourses);
      },
      error: (error) => {
        console.error('❌ Error al cargar progreso:', error);
        
        // Fallback: mostrar cursos sin progreso detallado
        this.enrolledCourses = courses.map(course => ({
          ...course,
          progress: 0,
          completedActivities: 0,
          totalActivities: 0,
          totalExercises: 0,
          totalChallenges: 0,
          earnedXP: 0
        }));
      }
    });
  }

  joinCourse() {
    const code = this.inviteCode.trim().toUpperCase();
    
    if (!code) {
      this.snackBar.open('Por favor ingresa un código', 'Cerrar', { duration: 2000 });
      return;
    }

    this.isJoining = true;

    this.courseService.joinCourseByCode(code).subscribe({
      next: (response: JoinCourseResponse) => {
        console.log('✅ Unido al curso:', response);
        
        this.inviteCode = '';
        this.isJoining = false;
        
        this.snackBar.open(
          `✅ ¡Bienvenido al curso "${response.course.title}"!`,
          'Cerrar',
          { duration: 5000, panelClass: ['success-snackbar'] }
        );

        // Recargar dashboard
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('❌ Error al unirse:', error);
        this.isJoining = false;
        
        let errorMessage = 'No se pudo unir al curso';
        
        if (error.status === 404) {
          errorMessage = 'Código inválido';
        } else if (error.status === 400 && error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getProgressColor(progress: number): string {
    if (progress < 30) return 'linear-gradient(to right, #f5576c, #fa709a)';
    if (progress < 70) return 'linear-gradient(to right, #fa709a, #f093fb)';
    return 'linear-gradient(to right, #43e97b, #38f9d7)';
  }

  enterCourse(course: EnrolledCourse) {
    if (!course.id) {
      this.snackBar.open('❌ Error: el curso no tiene ID', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('📖 Entrando al curso:', course.title);
    this.router.navigate(['/student/course', course.id]);
  }

  viewProgress(course: EnrolledCourse) {
    console.log('📊 Viendo progreso de:', course.title);
    this.snackBar.open(
      `Progreso: ${Math.round(course.progress)}% completado`,
      'Cerrar',
      { duration: 3000 }
    );
  }

  leaveCourse(course: Course) {
    this.courseToLeave = course;
    this.showLeaveConfirmModal = true;
  }

  confirmLeaveCourse() {
    if (!this.courseToLeave?.id) return;

    const courseId = this.courseToLeave.id;
    const courseTitle = this.courseToLeave.title;

    this.showLeaveConfirmModal = false;

    this.courseService.leaveCourse(courseId).subscribe({
      next: () => {
        this.enrolledCourses = this.enrolledCourses.filter(c => c.id !== courseId);
        this.loadDashboardData(); // Recargar stats

        this.snackBar.open(
          `✅ Has abandonado "${courseTitle}"`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );

        this.courseToLeave = null;
      },
      error: (err) => {
        console.error('❌ Error al salir:', err);

        this.snackBar.open(
          '❌ Error al abandonar el curso',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );

        this.courseToLeave = null;
      }
    });
  }

  cancelLeaveCourse() {
    this.showLeaveConfirmModal = false;
    this.courseToLeave = null;
  }

  logout() {
    this.showLogoutConfirmModal = true;
  }

  confirmLogout() {
    this.showLogoutConfirmModal = false;
    this.authService.logout();
    this.snackBar.open('👋 Sesión cerrada', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.showLogoutConfirmModal = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  get leaveConfirmMessage(): string {
    return `¿Abandonar "${this.courseToLeave?.title || ''}"? Perderás todo tu progreso.`;
  }
}