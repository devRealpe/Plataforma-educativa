import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Challenge } from '../../../../../../core/services/challenge.service';

@Component({
  selector: 'app-challenge-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './challenge-list.component.html',
  styleUrls: ['./challenge-list.component.scss']
})
export class ChallengeListComponent {
  @Input() challenges: Challenge[] = [];
  @Input() isLoading = false;

  @Output() createChallenge = new EventEmitter<void>();
  @Output() editChallenge = new EventEmitter<Challenge>();
  @Output() deleteChallenge = new EventEmitter<Challenge>();
  @Output() downloadChallenge = new EventEmitter<Challenge>();
  @Output() viewSubmissions = new EventEmitter<Challenge>();
  @Output() openExternalUrl = new EventEmitter<string>();

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      'Principiante': '#10b981',
      'Intermedio': '#f59e0b',
      'Avanzado': '#ef4444',
      'Experto': '#8b5cf6',
      'BASICO': '#10b981',
      'INTERMEDIO': '#f59e0b',
      'AVANZADO': '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  }

  onCreateChallenge() {
    this.createChallenge.emit();
  }

  onEditChallenge(challenge: Challenge) {
    this.editChallenge.emit(challenge);
  }

  onDeleteChallenge(challenge: Challenge) {
    this.deleteChallenge.emit(challenge);
  }

  onDownloadChallenge(challenge: Challenge) {
    this.downloadChallenge.emit(challenge);
  }

  onViewSubmissions(challenge: Challenge) {
    this.viewSubmissions.emit(challenge);
  }

  onOpenExternalUrl(url: string) {
    this.openExternalUrl.emit(url);
  }
}