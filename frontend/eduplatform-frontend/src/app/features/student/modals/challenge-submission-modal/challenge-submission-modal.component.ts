import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../../core/services/challenge.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-challenge-submission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge-submission-modal.component.html',
  styleUrls: ['./challenge-submission-modal.component.scss']
})
export class ChallengeSubmissionModalComponent implements OnInit {
  @Input() challenge!: Challenge;
  @Input() existingSubmission?: ChallengeSubmission;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submissionCreated = new EventEmitter<ChallengeSubmission>();

  isSubmitting = false;
  selectedFile: File | null = null;
  isEditMode = false;

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.existingSubmission;
    
    if (this.existingSubmission && !this.existingSubmission.canBeEdited) {
      this.snackBar.open(
        '⚠️ Esta solución ya no puede ser editada',
        'Cerrar',
        { duration: 4000, panelClass: ['warning-snackbar'] }
      );
      this.close();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('El archivo no debe superar 10MB', 'Cerrar', { duration: 3000 });
        return;
      }
      this.selectedFile = file;
      console.log('📁 Archivo seleccionado:', file.name);
    }
  }

  removeFile() {
    this.selectedFile = null;
  }

  isFormValid(): boolean {
    return !!this.selectedFile;
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting || !this.challenge.id) {
      return;
    }

    this.isSubmitting = true;

    const request$ = this.isEditMode && this.existingSubmission?.id
      ? this.challengeService.updateChallengeSubmission(this.existingSubmission.id, this.selectedFile!)
      : this.challengeService.submitChallenge(this.challenge.id, this.selectedFile!);

    request$.subscribe({
      next: (submission) => {
        this.snackBar.open(
          this.isEditMode 
            ? '✅ Solución actualizada exitosamente' 
            : '✅ Solución enviada exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.submissionCreated.emit(submission);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.snackBar.open(
          error.error?.error || 'Error al enviar la solución',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
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

  getDaysUntilDeadline(): number | null {
    if (!this.challenge.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(this.challenge.deadline);
    
    if (now > deadline) return 0;
    
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDeadlineMessage(): string {
    const days = this.getDaysUntilDeadline();
    
    if (days === null) return '';
    if (days === 0) return '⏰ Plazo vencido';
    if (days === 1) return '⚠️ ¡Último día!';
    if (days <= 3) return `⚠️ Quedan ${days} días`;
    return `📅 ${days} días restantes`;
  }
}