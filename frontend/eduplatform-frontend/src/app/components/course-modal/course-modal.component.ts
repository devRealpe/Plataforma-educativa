import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../services/course.service';

interface CourseForm {
  title: string;
  description: string;
  level: string;
}

@Component({
  selector: 'app-create-course-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-modal.component.html',
  styleUrls: ['./course-modal.component.scss'],
})
export class CourseModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() courseCreated = new EventEmitter<Course>(); // devolvemos el curso real

  isOpen = true;

  courseForm: CourseForm = {
    title: '',
    description: '',
    level: 'Principiante',
  };

  levels = [
    { value: 'Principiante', label: 'Principiante' },
    { value: 'Intermedio', label: 'Intermedio' },
    { value: 'Avanzado', label: 'Avanzado' },
  ];

  constructor(private courseService: CourseService) {}

  close(): void {
    this.isOpen = false;
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.courseForm.title.trim() && this.courseForm.description.trim()) {
      // Construimos el objeto de curso que espera el backend
      const newCourse: Course = {
        title: this.courseForm.title,
        description: this.courseForm.description,
        level: this.courseForm.level, // ✅ corregido
        inviteLink: '',
      };

      this.courseService.createCourse(newCourse).subscribe({
        next: (created) => {
          console.log('✅ Curso creado:', created);
          this.courseCreated.emit(created); // devolvemos el curso al padre
          this.close();
        },
        error: (err) => {
          console.error('❌ Error al crear curso', err);
        },
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
