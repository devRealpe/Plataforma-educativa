import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService, Challenge, ChallengeSubmission } from '../../../../core/services/challenge.service';
import { ChallengeSubmissionModalComponent } from '../../modals/challenge-submission-modal/challenge-submission-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-challenges-view',
  standalone: true,
  imports: [CommonModule, ChallengeSubmissionModalComponent],
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

  // ✅ MÉTODO AGREGADO: Abrir modal con soporte para edición
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

  // ✅ MÉTODO AGREGADO: Descargar mi solución enviada
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
}