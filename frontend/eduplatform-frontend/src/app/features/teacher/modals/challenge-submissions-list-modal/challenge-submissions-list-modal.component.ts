import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService, ChallengeSubmission } from '../../../../core/services/challenge.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReviewChallengeSubmissionModalComponent } from '../review-challenge-submission-modal/review-challenge-submission-modal.component';

@Component({
  selector: 'app-challenge-submissions-list-modal',
  standalone: true,
  imports: [CommonModule, ReviewChallengeSubmissionModalComponent],
  templateUrl: './challenge-submissions-list-modal.component.html',
  styleUrls: ['./challenge-submissions-list-modal.component.scss']
})
export class ChallengeSubmissionsListModalComponent implements OnInit {
  @Input() challengeId!: number;
  @Input() challengeTitle!: string;
  @Input() maxBonusPoints: number = 10;
  @Output() closeModal = new EventEmitter<void>();

  submissions: ChallengeSubmission[] = [];
  isLoading = true;
  
  // Modal de revisión individual
  showReviewModal = false;
  selectedSubmission: ChallengeSubmission | null = null;

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('🔍 Cargando soluciones para reto:', this.challengeId);
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.isLoading = true;
    this.challengeService.getChallengeSubmissions(this.challengeId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.isLoading = false;
        console.log('✅ Soluciones cargadas:', submissions);
      },
      error: (error) => {
        console.error('❌ Error al cargar soluciones:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar soluciones', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getPendingCount(): number {
    return this.submissions.filter(s => s.status === 'PENDING').length;
  }

  getReviewedCount(): number {
    return this.submissions.filter(s => s.status === 'REVIEWED').length;
  }

  getAverageBonusPoints(): string {
    const reviewed = this.submissions.filter(s => s.status === 'REVIEWED' && s.bonusPoints);
    if (reviewed.length === 0) return '-';
    const sum = reviewed.reduce((acc, s) => acc + (s.bonusPoints || 0), 0);
    return (sum / reviewed.length).toFixed(1);
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'REVIEWED': return 'Revisado';
      case 'REJECTED': return 'Rechazado';
      default: return 'Desconocido';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  reviewSubmission(submission: ChallengeSubmission) {
    console.log('🔍 Revisando solución:', submission);
    this.selectedSubmission = submission;
    this.showReviewModal = true;
  }

  closeReviewModal() {
    this.showReviewModal = false;
    this.selectedSubmission = null;
    this.loadSubmissions(); // Recargar lista después de revisar
  }

  handleSubmissionReviewed(updatedSubmission: ChallengeSubmission) {
    const index = this.submissions.findIndex(s => s.id === updatedSubmission.id);
    if (index !== -1) {
      this.submissions[index] = updatedSubmission;
    }
    this.closeReviewModal();
  }

  downloadSubmission(submission: ChallengeSubmission) {
    if (!submission.id) return;

    this.challengeService.downloadChallengeSubmission(submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'solucion.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('✅ Archivo descargado', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('❌ Error al descargar:', error);
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
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