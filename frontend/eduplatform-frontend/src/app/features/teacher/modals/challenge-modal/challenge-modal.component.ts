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

  challengeForm: Challenge = {
    title: '',
    description: '',
    difficulty: '',
    maxBonusPoints: 5,
    deadline: '',
    active: true
  };

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.editingChallenge) {
      this.challengeForm = { ...this.editingChallenge };
      if (this.challengeForm.deadline) {
        const date = new Date(this.challengeForm.deadline);
        this.challengeForm.deadline = date.toISOString().slice(0, 16);
      }
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
    }
  }

  removeFile() {
    this.selectedFile = null;
    if (this.editingChallenge) {
      this.editingChallenge.fileName = undefined;
    }
  }

  isFormValid(): boolean {
    return !!(
      this.challengeForm.title &&
      this.challengeForm.description &&
      this.challengeForm.difficulty &&
      this.challengeForm.maxBonusPoints &&
      this.challengeForm.maxBonusPoints >= 1 &&
      this.challengeForm.maxBonusPoints <= 10
    );
  }

  onSubmit() {
    if (!this.isFormValid() || this.isSubmitting) return;

    this.isSubmitting = true;
    this.challengeForm.courseId = this.courseId;

    const request$ = this.editingChallenge?.id
      ? this.challengeService.updateChallenge(
          this.editingChallenge.id, 
          this.challengeForm, 
          this.selectedFile || undefined
        )
      : this.challengeService.createChallenge(
          this.challengeForm, 
          this.courseId, 
          this.selectedFile || undefined
        );

    request$.subscribe({
      next: (challenge) => {
        this.snackBar.open(
          this.editingChallenge ? '✅ Reto actualizado' : '✅ Reto publicado', 
          'Cerrar', 
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );
        this.challengeCreated.emit(challenge);
        this.close();
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.snackBar.open('Error al guardar el reto', 'Cerrar', {
          duration: 3000,
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
}