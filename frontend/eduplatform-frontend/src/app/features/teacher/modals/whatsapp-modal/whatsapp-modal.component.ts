import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '../../../../core/services/course.service';

@Component({
  selector: 'app-whatsapp-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-modal.component.html',
  styleUrls: ['./whatsapp-modal.component.scss']
})
export class WhatsappModalComponent implements OnInit {
  @Input() courseId!: number;
  @Input() courseTitle: string = '';
  @Input() currentLink: string | null = null;
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() linkUpdated = new EventEmitter<string>();

  whatsappLink: string = '';
  isSubmitting: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.currentLink) {
      this.whatsappLink = this.currentLink;
    }
  }

  isValidUrl(url: string): boolean {
    if (!url || url.trim().length === 0) {
      return false;
    }

    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('https://chat.whatsapp.com/') || 
           trimmed.startsWith('https://wa.me/');
  }

  saveLink() {
    this.showError = false;

    if (!this.whatsappLink || !this.whatsappLink.trim()) {
      this.showError = true;
      this.errorMessage = 'Por favor ingresa un enlace';
      return;
    }

    if (!this.isValidUrl(this.whatsappLink)) {
      this.showError = true;
      this.errorMessage = 'El enlace debe comenzar con https://chat.whatsapp.com/ o https://wa.me/';
      return;
    }

    this.isSubmitting = true;

    this.courseService.setWhatsappLink(this.courseId, this.whatsappLink.trim()).subscribe({
      next: (response) => {
        this.snackBar.open('✅ Enlace de WhatsApp configurado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.linkUpdated.emit(this.whatsappLink.trim());
        this.closeModal();
      },
      error: (error) => {
        console.error('❌ Error al guardar enlace:', error);
        this.snackBar.open(
          error.error?.error || 'Error al guardar el enlace',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSubmitting = false;
      }
    });
  }

  deleteLink() {
    if (!confirm('¿Estás seguro de que deseas eliminar el enlace de WhatsApp?\n\nLos estudiantes ya no podrán ver el enlace del grupo.')) {
      return;
    }

    this.isSubmitting = true;

    this.courseService.removeWhatsappLink(this.courseId).subscribe({
      next: () => {
        this.snackBar.open('✅ Enlace eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.linkUpdated.emit('');
        this.closeModal();
      },
      error: (error) => {
        console.error('❌ Error al eliminar enlace:', error);
        this.snackBar.open('Error al eliminar el enlace', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSubmitting = false;
      }
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }
}