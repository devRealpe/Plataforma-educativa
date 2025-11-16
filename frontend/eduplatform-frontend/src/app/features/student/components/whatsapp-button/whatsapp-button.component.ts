import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CourseService } from '../../../../core/services/course.service';

/**
 * 💬 Componente para que estudiantes vean y accedan al grupo de WhatsApp
 * Se muestra como un banner o botón en la vista del curso
 */
@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './whatsapp-button.component.html',
  styleUrls: ['./whatsapp-button.component.scss']
})
export class WhatsappButtonComponent implements OnInit {
  @Input() courseId!: number;

  isLoading = true;
  hasLink = false;
  whatsappLink: string | null = null;

  constructor(
    private courseService: CourseService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadWhatsappLink();
  }

  loadWhatsappLink() {
    this.isLoading = true;
    
    this.courseService.getWhatsappLink(this.courseId).subscribe({
      next: (response) => {
        this.hasLink = response.hasLink || false;
        this.whatsappLink = response.whatsappLink || null;
        this.isLoading = false;
        
        console.log('📱 WhatsApp:', this.hasLink ? 'Disponible' : 'No configurado');
      },
      error: (error) => {
        console.error('❌ Error al cargar enlace de WhatsApp:', error);
        this.isLoading = false;
        this.hasLink = false;
      }
    });
  }

  openWhatsapp() {
    if (!this.whatsappLink) {
      this.snackBar.open('❌ No hay enlace disponible', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    try {
      new URL(this.whatsappLink); // Validar URL
      window.open(this.whatsappLink, '_blank', 'noopener,noreferrer');
      
      this.snackBar.open('💬 Abriendo WhatsApp...', '', {
        duration: 2000,
        panelClass: ['success-snackbar']
      });
    } catch (error) {
      console.error('❌ URL inválida:', this.whatsappLink, error);
      this.snackBar.open('❌ Enlace inválido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
