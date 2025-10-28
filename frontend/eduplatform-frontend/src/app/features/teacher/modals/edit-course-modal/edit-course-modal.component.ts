import { Component, EventEmitter, Output, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../../../core/services/course.service';

@Component({
  selector: 'app-edit-course-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-course-modal.component.html',
  styleUrls: ['./edit-course-modal.component.scss'],
})
export class EditCourseModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() courseUpdated = new EventEmitter<Course>();
  @Input() course!: Course; // Curso a editar (requerido)

  isOpen = true;
  isSubmitting = false;

  courseForm: Course = {
    title: '',
    description: '',
    level: 'Principiante',
  };

  levels = [
    {
      value: 'Principiante',
      label: 'Principiante',
      description: 'Ideal para quienes están comenzando',
      icon: '🌱'
    },
    {
      value: 'Intermedio',
      label: 'Intermedio',
      description: 'Para estudiantes con conocimientos básicos',
      icon: '🎯'
    },
    {
      value: 'Avanzado',
      label: 'Avanzado',
      description: 'Requiere dominio de conceptos previos',
      icon: '🚀'
    },
    {
      value: 'Experto',
      label: 'Experto',
      description: 'Nivel profesional y especializado',
      icon: '⭐'
    }
  ];

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    // Cargar los datos del curso
    if (this.course) {
      this.courseForm = { ...this.course };
    } else {
      console.error('❌ No se proporcionó un curso para editar');
      this.close();
    }
  }

  /**
   * Actualiza el curso
   */
  onSubmit() {
    if (!this.isFormValid()) {
      console.warn('⚠️ Por favor completa todos los campos requeridos');
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    if (!this.course.id) {
      console.error('❌ El curso no tiene ID');
      return;
    }

    this.isSubmitting = true;

    this.courseService.updateCourse(this.course.id, this.courseForm).subscribe({
      next: (updatedCourse) => {
        console.log('✅ Curso actualizado exitosamente:', updatedCourse);
        this.courseUpdated.emit(updatedCourse);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error al actualizar el curso:', error);
        this.isSubmitting = false;
        alert('Error al actualizar el curso. Por favor intenta de nuevo.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Cierra el modal con animación
   */
  close() {
    this.isOpen = false;
    setTimeout(() => {
      this.closeModal.emit();
    }, 300);
  }

  /**
   * Maneja el clic en el backdrop
   */
  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  /**
   * Verifica si el formulario es válido
   */
  isFormValid(): boolean {
    return !!(
      this.courseForm.title &&
      this.courseForm.description &&
      this.courseForm.level
    );
  }

  /**
   * Verifica si hubo cambios en el formulario
   */
  hasChanges(): boolean {
    return (
      this.courseForm.title !== this.course.title ||
      this.courseForm.description !== this.course.description ||
      this.courseForm.level !== this.course.level
    );
  }

  /**
   * Obtiene el texto del botón de submit
   */
  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return '💾 Guardando...';
    }
    return this.hasChanges() ? '💾 Guardar Cambios' : '✓ Sin Cambios';
  }

  /**
   * Maneja la tecla Escape para cerrar el modal
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (!this.isSubmitting) {
      this.close();
    }
  }
}