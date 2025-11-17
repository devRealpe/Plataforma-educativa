import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../../../../core/services/challenge.service';
import { ConfirmationModalComponent } from '../../../../../../shared/components/confirmation-modal/confirmation-modal.component';
// ✅ AGREGADO: Importar MotivationalMessagesComponent
import { MotivationalMessagesComponent } from '../../../motivational-messages/motivational-messages.component';

@Component({
  selector: 'app-challenge-list',
  standalone: true,
  // ✅ AGREGADO: MotivationalMessagesComponent en imports
  imports: [CommonModule, ConfirmationModalComponent, MotivationalMessagesComponent],
  templateUrl: './challenge-list.component.html',
  styleUrls: ['./challenge-list.component.scss']
})
export class ChallengeListComponent implements OnInit {
  @Input() courseId!: number;
  @Input() challenges: Challenge[] = [];
  @Input() submissions: ChallengeSubmission[] = [];
  @Input() isLoading = false;

  @Output() openSubmissionModalEvent = new EventEmitter<{
    challenge: Challenge;
    existingSubmission?: ChallengeSubmission;
  }>();

  // Estado del modal de subir/editar solución
  showSubmissionModal = false;
  selectedChallenge: Challenge | null = null;
  existingSubmission: ChallengeSubmission | undefined;
  selectedFile: File | null = null;
  isSubmitting = false;
  isEditMode = false;

  // Estado del modal de eliminar
  showDeleteSubmissionModal = false;
  submissionToDelete: ChallengeSubmission | null = null;
  challengeToDelete: Challenge | null = null;

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.submissions.length === 0) {
      this.loadMySubmissions();
    }
  }

  loadMySubmissions() {
    this.challengeService.getMyChallengeSubmissions().subscribe({
      next: (submissions) => {
        this.submissions = submissions;
      },
      error: (error) => {
        console.error('Error al cargar mis soluciones:', error);
      }
    });
  }

  getMySubmission(challengeId: number): ChallengeSubmission | undefined {
    return this.submissions.find(s => s.challengeId === challengeId);
  }

  hasSubmitted(challengeId: number): boolean {
    return !!this.getMySubmission(challengeId);
  }

  openSubmissionModal(challenge: Challenge, existingSubmission?: ChallengeSubmission) {
    const submission = existingSubmission || this.getMySubmission(challenge.id!);
    
    if (submission && !submission.canBeEdited) {
      this.snackBar.open(
        '⚠️ Esta solución ya no puede ser editada',
        'Cerrar',
        { duration: 4000, panelClass: ['warning-snackbar'] }
      );
      return;
    }

    this.openSubmissionModalEvent.emit({
      challenge: challenge,
      existingSubmission: submission
    });
  }

  closeSubmissionModal() {
    this.showSubmissionModal = false;
    this.selectedChallenge = null;
    this.existingSubmission = undefined;
    this.selectedFile = null;
    this.isEditMode = false;
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

  submitSolution() {
    if (!this.isFormValid() || this.isSubmitting || !this.selectedChallenge?.id) {
      return;
    }

    this.isSubmitting = true;

    const request$ = this.isEditMode && this.existingSubmission?.id
      ? this.challengeService.updateChallengeSubmission(this.existingSubmission.id, this.selectedFile!)
      : this.challengeService.submitChallenge(this.selectedChallenge.id, this.selectedFile!);

    request$.subscribe({
      next: (submission) => {
        const existingIndex = this.submissions.findIndex(s => s.challengeId === submission.challengeId);
        
        if (existingIndex !== -1) {
          this.submissions[existingIndex] = submission;
        } else {
          this.submissions.push(submission);
        }

        this.snackBar.open(
          this.isEditMode 
            ? '✅ Solución actualizada exitosamente' 
            : '✅ Solución enviada exitosamente',
          'Cerrar',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
        
        this.loadMySubmissions();
        this.closeSubmissionModal();
        this.isSubmitting = false;
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

  getDaysUntilDeadline(challenge: Challenge): number | null {
    if (!challenge.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(challenge.deadline);
    
    if (now > deadline) return 0;
    
    const diff = deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDeadlineMessage(challenge: Challenge): string {
    const days = this.getDaysUntilDeadline(challenge);
    
    if (days === null) return '';
    if (days === 0) return '⏰ Plazo vencido';
    if (days === 1) return '⚠️ ¡Último día!';
    if (days <= 3) return `⚠️ Quedan ${days} días`;
    return `📅 ${days} días restantes`;
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
        this.submissions = this.submissions.filter(s => s.id !== submissionId);
        
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