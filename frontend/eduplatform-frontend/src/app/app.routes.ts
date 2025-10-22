import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LandingComponent } from './components/landing/landing.component';
import { AuthGuard } from './services/auth.guard';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component'; 
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';
import { StudentCourseViewComponent } from './components/student-course-view/student-course-view.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'teacher-dashboard', component: TeacherDashboardComponent, canActivate: [AuthGuard] },
  { path: 'student-dashboard', component: StudentDashboardComponent, canActivate: [AuthGuard] },
  { path: 'course/:id', component: CourseDetailComponent, canActivate: [AuthGuard] },
  { path: 'student/course/:id', component: StudentCourseViewComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: '**', redirectTo: 'landing' },
];