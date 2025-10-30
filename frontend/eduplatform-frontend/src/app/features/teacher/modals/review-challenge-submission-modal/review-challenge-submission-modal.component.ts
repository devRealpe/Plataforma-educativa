import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChallengeService, ChallengeSubmission } from '../../../../core/services/challenge.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-review-challenge-submission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-challenge-submission-modal.component.html',
  styleUrls: ['./review-challenge-submission-modal.component.scss']
})
export class ReviewChallengeSubmissionModalComponent implements OnInit {
  @Input() submission!: ChallengeSubmission;
  @Input() maxBonusPoints: number = 10;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submissionReviewed = new EventEmitter<ChallengeSubmission>();
  @Input() challengeId!: number;
@Input() challengeTitle!: string;


  isSubmitting = false;
  bonusPoints: number = 0;
  feedback: string = '';

  constructor(
    public challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.submission.status === 'REVIEWED') {
      this.bonusPoints = this.submission.bonusPoints || 0;
      this.feedback = this.submission.feedback || '';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.submission.status) {
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getStatusText(): string {
    switch (this.submission.status) {
      case 'PENDING': return '⏳ Pendiente de Revisión';
      case 'REVIEWED': return '✅ Revisado';
      case 'REJECTED': return '❌ Rechazado';
      default: return 'Desconocido';
    }
  }

  isFormValid(): boolean {
    return this.bonusPoints >= 0 && 
           this.bonusPoints <= this.maxBonusPoints && 
           this.feedback.trim().length > 0;
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting || !this.submission.id) {
      return;
    }

    this.isSubmitting = true;

    this.challengeService.reviewChallengeSubmission(
      this.submission.id, 
      this.bonusPoints, 
      this.feedback
    ).subscribe({
      next: (updatedSubmission) => {
        this.snackBar.open(
          '✅ Solución revisada exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.submissionReviewed.emit(updatedSubmission);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.snackBar.open(
          error.error?.error || 'Error al revisar la solución',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        this.isSubmitting = false;
      }
    });
  }

  downloadSubmission() {
    if (!this.submission.id) return;

    this.challengeService.downloadChallengeSubmission(this.submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.submission.fileName || 'solucion.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('📥 Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al descargar:', error);
        this.snackBar.open('Error al descargar el archivo', 'Cerrar', { duration: 3000 });
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

  formatDate(dateString?: string): string {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}