import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../services/course.service';
import { CourseModalComponent } from '../course-modal/course-modal.component';


interface StatCard {
  title: string;
  value: number;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, CourseModalComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent implements OnInit {
  stats: StatCard[] = [];
  courses: Course[] = [];
  showModal = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getMyCourses().subscribe((courses) => {
      this.courses = courses;
      this.updateStats();
    });
  }

  updateStats(): void {
    this.stats = [
      {
        title: 'Cursos Activos',
        value: this.courses.length,
        icon: '📚',
        bgColor: '#bfdbfe'
      }
    ];
  }

  // 👉 Para abrir el modal
  openModal(): void {
    this.showModal = true;
  }

  // 👉 Para cerrarlo
  closeModal(): void {
    this.showModal = false;
  }

  // 👉 Cuando se crea un curso nuevo
handleCourseCreated(course: Course): void {
  this.courses.push(course);
  this.updateStats();
}


  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copiado al portapapeles');
    });
  }
}
