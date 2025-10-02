import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../services/course.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-create-course-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-modal.component.html',
  styleUrls: ['./course-modal.component.scss'],
})
export class CourseModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() courseCreated = new EventEmitter<Course>();
  @Input() editingCourse: Course | null = null;

  isOpen = true;
  isSubmitting = false; // Estado de carga para evitar doble submit

  courseForm: Course = {
    title: '',
    description: '',
    level: 'Principiante',
  };

  // Niveles con información completa para el diseño mejorado
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
    // Cargar datos del curso si estamos en modo edición
    if (this.editingCourse) {
      this.courseForm = { ...this.editingCourse };
    }
  }

  /**
   * Envía el formulario para crear o actualizar un curso
   */
  onSubmit() {
    // Validar que todos los campos requeridos estén completos
    if (!this.courseForm.title || !this.courseForm.description || !this.courseForm.level) {
      console.warn('⚠️ Por favor completa todos los campos requeridos');
      return;
    }

    // Evitar múltiples envíos
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.editingCourse && this.editingCourse.id) {
      // Actualizar curso existente
      this.updateCourse();
    } else {
      // Crear nuevo curso
      this.createCourse();
    }
  }

  /**
   * Crea un nuevo curso
   */
  private createCourse() {
    this.courseService.createCourse(this.courseForm).subscribe({
      next: (course) => {
        console.log('✅ Curso creado exitosamente:', course);
        this.courseCreated.emit(course);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error al crear el curso:', error);
        this.isSubmitting = false;
        // Aquí podrías mostrar un mensaje de error al usuario
        alert('Error al crear el curso. Por favor intenta de nuevo.');
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Actualiza un curso existente
   */
  private updateCourse() {
    if (!this.editingCourse?.id) {
      return;
    }

    this.courseService.updateCourse(this.editingCourse.id, this.courseForm).subscribe({
      next: (updatedCourse) => {
        console.log('✅ Curso actualizado exitosamente:', updatedCourse);
        this.courseCreated.emit(updatedCourse);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error al actualizar el curso:', error);
        this.isSubmitting = false;
        // Aquí podrías mostrar un mensaje de error al usuario
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
    // Esperar a que termine la animación antes de emitir el evento
    setTimeout(() => {
      this.closeModal.emit();
      this.resetForm();
    }, 300);
  }

  /**
   * Resetea el formulario a su estado inicial
   */
  private resetForm() {
    this.courseForm = {
      title: '',
      description: '',
      level: 'Principiante',
    };
    this.editingCourse = null;
    this.isSubmitting = false;
  }

  /**
   * Maneja el clic en el backdrop para cerrar el modal
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
   * Obtiene el título del modal según el modo
   */
  getModalTitle(): string {
    return this.editingCourse ? '✏️ Editar Curso' : '✨ Crear Nuevo Curso';
  }

  /**
   * Obtiene el subtítulo del modal según el modo
   */
  getModalSubtitle(): string {
    return this.editingCourse
      ? 'Actualiza la información de tu curso'
      : 'Configura tu nuevo curso educativo al estilo videojuego';
  }

  /**
   * Obtiene el texto del botón de submit según el modo
   */
  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      return this.editingCourse ? 'Guardando...' : 'Creando...';
    }
    return this.editingCourse ? '💾 Guardar Cambios' : '🚀 Crear Curso';
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