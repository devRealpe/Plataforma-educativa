import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

interface Student {
  id: number;
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-manage-students-modal',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  templateUrl: `./manage-students-modal.component.html`,
  styleUrls: ['./manage-students-modal.component.scss']
})
export class ManageStudentsModalComponent implements OnInit {
  @Input() courseId!: number;
  @Input() courseTitle: string = '';
  @Output() closeModal = new EventEmitter<void>();

  students: Student[] = [];
  isLoading = true;
  showConfirmModal = false;
  studentToRemove: Student | null = null;

  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.isLoading = true;
    this.http.get<Student[]>(`${this.apiUrl}/${this.courseId}/students`).subscribe({
      next: (students) => {
        this.students = students;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar estudiantes:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar estudiantes', 'Cerrar', { duration: 3000 });
      }
    });
  }

  removeStudent(student: Student) {
    this.studentToRemove = student;
    this.showConfirmModal = true;
  }

  confirmRemove() {
    if (!this.studentToRemove) return;

    const studentId = this.studentToRemove.id;
    const studentName = this.studentToRemove.nombre;

    this.showConfirmModal = false;

    this.http.delete(`${this.apiUrl}/${this.courseId}/students/${studentId}`).subscribe({
      next: () => {
        this.students = this.students.filter(s => s.id !== studentId);
        this.snackBar.open(
          `✅ ${studentName} eliminado del curso`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        this.studentToRemove = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar estudiante:', error);
        this.snackBar.open('Error al eliminar estudiante', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.studentToRemove = null;
      }
    });
  }

  cancelRemove() {
    this.showConfirmModal = false;
    this.studentToRemove = null;
  }

  getConfirmMessage(): string {
    return `¿Estás seguro de que deseas eliminar a "${this.studentToRemove?.nombre}" del curso? Esta acción no se puede deshacer.`;
  }

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.close();
    }
  }
}