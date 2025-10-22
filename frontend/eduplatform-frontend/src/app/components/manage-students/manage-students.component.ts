import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

interface Student {
  id: number;
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-manage-students-modal',
  standalone: true,
  imports: [CommonModule, ConfirmationModalComponent],
  template: `
    <div class="modal-overlay" (click)="onBackdropClick($event)">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <h2 class="modal-title">Gestionar Estudiantes</h2>
              <p class="modal-subtitle">{{ courseTitle }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <!-- Loading -->
          <div *ngIf="isLoading" class="loading">
            <div class="spinner"></div>
            <p>Cargando estudiantes...</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && students.length === 0" class="empty-state">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h3>No hay estudiantes inscritos</h3>
            <p>Comparte el código de invitación para que los estudiantes se unan</p>
          </div>

          <!-- Students List -->
          <div *ngIf="!isLoading && students.length > 0" class="students-list">
            <div class="students-header">
              <h3 class="students-count">
                {{ students.length }} {{ students.length === 1 ? 'Estudiante' : 'Estudiantes' }}
              </h3>
            </div>

            <div *ngFor="let student of students; let i = index" class="student-card">
              <div class="student-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="student-info">
                <h4 class="student-name">{{ student.nombre }}</h4>
                <p class="student-email">{{ student.email }}</p>
              </div>
              <button 
                class="remove-btn" 
                (click)="removeStudent(student)"
                title="Eliminar estudiante">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" (click)="close()">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      *ngIf="showConfirmModal && studentToRemove"
      title="¿Eliminar estudiante?"
      [message]="getConfirmMessage()"
      confirmText="Eliminar"
      cancelText="Cancelar"
      type="danger"
      (confirm)="confirmRemove()"
      (cancel)="cancelRemove()"
    >
    </app-confirmation-modal>
  `,
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