import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService, Challenge } from '../../../../core/services/challenge.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-challenge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-modal.component.html',
  styleUrls: ['./challenge-modal.component.scss']
})
export class ChallengeModalComponent implements OnInit {
  @Input() courseId!: number;
  @Input() editingChallenge: Challenge | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() challengeCreated = new EventEmitter<Challenge>();

  isSubmitting = false;
  selectedFile: File | null = null;
  fileRemoved = false;

  challengeForm: Challenge = {
    title: '',
    description: '',
    difficulty: '',
    maxBonusPoints: 5,
    deadline: '',
    active: true,
    externalUrl: ''
  };

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.editingChallenge) {
      this.challengeForm = { ...this.editingChallenge };
      
      // Formatear fecha para datetime-local
      if (this.challengeForm.deadline) {
        const date = new Date(this.challengeForm.deadline);
        this.challengeForm.deadline = date.toISOString().slice(0, 16);
      }

      //  Asegurar que externalUrl tenga valor
      if (!this.challengeForm.externalUrl) {
        this.challengeForm.externalUrl = '';
      }
    }
  }

    removeFile() {
    this.selectedFile = null;
    
    //  Marcar archivo para eliminación
    if (this.editingChallenge && this.editingChallenge.fileName) {
      this.fileRemoved = true;
      this.editingChallenge.fileName = undefined;
      console.log('🗑️ Archivo del reto marcado para eliminación');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:', file.name);
    }
  }

  isFormValid(): boolean {
    const hasBasicInfo = !!(
      this.challengeForm.title &&
      this.challengeForm.description &&
      this.challengeForm.difficulty &&
      this.challengeForm.maxBonusPoints &&
      this.challengeForm.maxBonusPoints >= 1 &&
      this.challengeForm.maxBonusPoints <= 10
    );

    //  Validar URL si está presente
    if (this.challengeForm.externalUrl && this.challengeForm.externalUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(this.challengeForm.externalUrl.trim())) {
        return false; // URL inválida
      }
    }

    return hasBasicInfo;
  }

 onSubmit() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.challengeForm.courseId = this.courseId;

    if (this.challengeForm.externalUrl) {
      this.challengeForm.externalUrl = this.challengeForm.externalUrl.trim();
      if (!this.challengeForm.externalUrl) {
        this.challengeForm.externalUrl = undefined;
      }
    }

    console.log('🏆 Enviando reto:', {
      title: this.challengeForm.title,
      hasFile: !!this.selectedFile,
      hasUrl: !!this.challengeForm.externalUrl,
      fileRemoved: this.fileRemoved, 
      externalUrl: this.challengeForm.externalUrl
    });

    const request$ = this.editingChallenge?.id
      ? this.challengeService.updateChallenge(
          this.editingChallenge.id,
          this.challengeForm,
          this.selectedFile || undefined,
          this.fileRemoved
        )
      : this.challengeService.createChallenge(
          this.challengeForm,
          this.courseId,
          this.selectedFile || undefined
        );

    request$.subscribe({
      next: (challenge) => {
        console.log('✅ Reto guardado:', challenge);
        
        const action = this.editingChallenge ? 'actualizado' : 'publicado';
        let message = `✅ Reto "${challenge.title}" ${action}`;
        
        if (challenge.hasFile && challenge.hasExternalUrl) {
          message += ' (con archivo y enlace)';
        } else if (challenge.hasFile) {
          message += ' (con archivo)';
        } else if (challenge.hasExternalUrl) {
          message += ' (con enlace externo)';
        } else if (this.fileRemoved) {
          message += ' (archivo eliminado)';
        }
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        
        this.challengeCreated.emit(challenge);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error al guardar reto:', error);
        
        let errorMessage = 'Error al guardar el reto';
        
        if (error.error?.error?.includes('URL')) {
          errorMessage = '❌ URL inválida. Debe comenzar con http:// o https://';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        
        this.isSubmitting = false;
      }
    });
  }

  close() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  // Método auxiliar para validar URL
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}