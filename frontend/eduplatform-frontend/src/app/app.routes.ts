import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { ProfileComponent } from './common/components/profile/profile.component';
import { LandingComponent } from './common/components/landing/landing.component';
import { AuthGuard } from './core/guards/auth.guard';
import { TeacherDashboardComponent } from './features/teacher/components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './features/student/components/student-dashboard/student-dashboard.component';
import { CourseHeaderComponent } from './features/teacher/components/course-detail/components/course-header/course-header.component';
import { StudentCourseViewComponent } from './features/student/components/student-course-view/student-course-view.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'teacher-dashboard', component: TeacherDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'course/:id', component: CourseHeaderComponent, canActivate: [AuthGuard] },
  { path: 'student/course/:id', component: StudentCourseViewComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' },
];