import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../../core/services/challenge.service';
import { ChallengeSubmissionModalComponent } from '../../modals/challenge-submission-modal/challenge-submission-modal.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-challenges-view',
  standalone: true,
  imports: [CommonModule, ChallengeSubmissionModalComponent, ConfirmationModalComponent],
  templateUrl: './challenges-view.component.html',
  styleUrls: ['./challenges-view.component.scss']
})
export class ChallengesViewComponent implements OnInit {
  @Input() courseId!: number;

  challenges: Challenge[] = [];
  mySubmissions: ChallengeSubmission[] = [];
  loading = true;

  showSubmissionModal = false;
  selectedChallenge: Challenge | null = null;
  existingSubmission: ChallengeSubmission | undefined;

  // Modal de confirmación de eliminación
  showDeleteSubmissionModal = false;
  submissionToDelete: ChallengeSubmission | null = null;
  challengeToDelete: Challenge | null = null;

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadChallenges();
    this.loadMySubmissions();
  }

  loadChallenges() {
    this.loading = true;
    this.challengeService.getChallengesByCourse(this.courseId).subscribe({
      next: (challenges) => {
        this.challenges = challenges;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar retos:', error);
        this.snackBar.open('Error al cargar los retos', 'Cerrar', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadMySubmissions() {
    this.challengeService.getMyChallengeSubmissions().subscribe({
      next: (submissions) => {
        this.mySubmissions = submissions;
      },
      error: (error) => {
        console.error('Error al cargar mis soluciones:', error);
      }
    });
  }

  getMySubmission(challengeId: number): ChallengeSubmission | undefined {
    return this.mySubmissions.find(s => s.challengeId === challengeId);
  }

  hasSubmitted(challengeId: number): boolean {
    return !!this.getMySubmission(challengeId);
  }

  // Abrir modal para edición
  openSubmissionModal(challenge: Challenge, existingSubmission?: ChallengeSubmission) {
    this.selectedChallenge = challenge;
    this.existingSubmission = existingSubmission || this.getMySubmission(challenge.id!);
    this.showSubmissionModal = true;
  }

  closeSubmissionModal() {
    this.showSubmissionModal = false;
    this.selectedChallenge = null;
    this.existingSubmission = undefined;
  }

  onSubmissionCreated(submission: ChallengeSubmission) {
    const existingIndex = this.mySubmissions.findIndex(s => s.challengeId === submission.challengeId);
    
    if (existingIndex !== -1) {
      this.mySubmissions[existingIndex] = submission;
    } else {
      this.mySubmissions.push(submission);
    }

    // Refrescar la lista de envios
    this.loadMySubmissions();

    this.snackBar.open('✅ Solución enviada exitosamente', 'Cerrar', { duration: 3000 });
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'BASICO': return '#10b981';
      case 'INTERMEDIO': return '#f59e0b';
      case 'AVANZADO': return '#ef4444';
      default: return '#6b7280';
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'REVIEWED': return 'status-reviewed';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getStatusText(status?: string): string {
    switch (status) {
      case 'PENDING': return '⏳ Pendiente';
      case 'REVIEWED': return '✅ Revisado';
      case 'REJECTED': return '❌ Rechazado';
      default: return 'Sin enviar';
    }
  }

  getDaysUntilDeadline(deadline?: string): number | null {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    
    if (now > deadlineDate) return 0;
    
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  downloadChallenge(challenge: Challenge) {
    if (!challenge.id) return;

    this.challengeService.downloadChallenge(challenge.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = challenge.fileName || 'reto.pdf';
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

  // Descargar mi solución enviada
  downloadMySubmission(submission: ChallengeSubmission) {
    if (!submission.id) return;

    this.challengeService.downloadChallengeSubmission(submission.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = submission.fileName || 'mi_solucion.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.snackBar.open('📥 Tu solución descargada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error al descargar solución:', error);
        this.snackBar.open('Error al descargar tu solución', 'Cerrar', { duration: 3000 });
      }
    });
  }

  // ========== MÉTODOS DE ELIMINACIÓN ==========

  // Eliminar mi solución de reto
  deleteChallengeSubmission(challenge: Challenge) {
    const submission = this.getMySubmission(challenge.id!);
    
    if (!submission) {
      this.snackBar.open('No se encontró tu solución', 'Cerrar', { duration: 3000 });
      return;
    }

    if (submission.status === 'REVIEWED') {
      this.snackBar.open(
        '🚫 No puedes eliminar una solución revisada',
        'Cerrar',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
      return;
    }

    this.submissionToDelete = submission;
    this.challengeToDelete = challenge;
    this.showDeleteSubmissionModal = true;
  }

  confirmDeleteSubmission() {
    if (!this.submissionToDelete?.id) return;

    const submissionId = this.submissionToDelete.id;
    const challengeTitle = this.challengeToDelete?.title || 'el reto';

    this.showDeleteSubmissionModal = false;

    this.challengeService.deleteChallengeSubmission(submissionId).subscribe({
      next: () => {
        // Eliminar de la lista local
        this.mySubmissions = this.mySubmissions.filter(s => s.id !== submissionId);
        
        this.snackBar.open(
          `✅ Solución de "${challengeTitle}" eliminada`,
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.submissionToDelete = null;
        this.challengeToDelete = null;
      },
      error: (error) => {
        console.error('❌ Error al eliminar solución:', error);
        this.snackBar.open(
          error.error?.error || 'Error al eliminar la solución',
          'Cerrar',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        
        this.submissionToDelete = null;
        this.challengeToDelete = null;
      }
    });
  }

  cancelDeleteSubmission() {
    this.showDeleteSubmissionModal = false;
    this.submissionToDelete = null;
    this.challengeToDelete = null;
  }

  getDeleteSubmissionMessage(): string {
    return `¿Estás seguro de que deseas eliminar tu solución para "${this.challengeToDelete?.title || 'este reto'}"?\n\nEsta acción no se puede deshacer.`;
  }
}