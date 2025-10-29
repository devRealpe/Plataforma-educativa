import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeService, PodiumEntry } from '../../../core/services/challenge.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() courseId!: number;
  @Input() courseLevel!: string;
  @Input() isTeacher: boolean = false;

  podiumEntries: PodiumEntry[] = [];
  myPosition: PodiumEntry | null = null;
  isLoading = true;
  viewMode: 'course' | 'level' = 'course';

  constructor(
    private challengeService: ChallengeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPodium();
    if (!this.isTeacher) {
      this.loadMyPosition();
    }
  }

  loadPodium() {
    this.isLoading = true;

    const request = this.viewMode === 'course'
      ? this.challengeService.getPodiumByCourse(this.courseId)
      : this.challengeService.getPodiumByLevel(this.courseLevel);

    request.subscribe({
      next: (entries) => {
        this.podiumEntries = entries;
        this.isLoading = false;
        console.log('✅ Podio cargado:', entries);
      },
      error: (error) => {
        console.error('❌ Error al cargar podio:', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar el podio', 'Cerrar', { duration: 3000 });
      }
    });
  }

  loadMyPosition() {
    this.challengeService.getMyPosition(this.courseId).subscribe({
      next: (position) => {
        this.myPosition = position;
        console.log('✅ Mi posición cargada:', position);
      },
      error: (error) => {
        console.error('❌ Error al cargar mi posición:', error);
      }
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'course' ? 'level' : 'course';
    this.loadPodium();
  }

  getMedalEmoji(position: number): string {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  }

  getMedalClass(position: number): string {
    switch (position) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return 'default';
    }
  }

  getProgressBarWidth(totalPoints: number): number {
    if (this.podiumEntries.length === 0) return 0;
    const maxPoints = this.podiumEntries[0]?.totalBonusPoints || 1;
    return Math.min((totalPoints / maxPoints) * 100, 100);
  }

  getProgressBarColor(position: number): string {
    switch (position) {
      case 1: return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
      case 2: return 'linear-gradient(90deg, #94a3b8, #64748b)';
      case 3: return 'linear-gradient(90deg, #f97316, #ea580c)';
      default: return 'linear-gradient(90deg, #3b82f6, #2563eb)';
    }
  }

  isMyEntry(entry: PodiumEntry): boolean {
    return !this.isTeacher && this.myPosition?.studentId === entry.studentId;
  }
}