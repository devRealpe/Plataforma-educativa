import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface PodiumEntry {
  studentId: number;
  studentName: string;
  studentEmail: string;
  totalBonusPoints: number;
  challengesCompleted: number;
  position: number;
}

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podium.component.html',
  styleUrls: ['./podium.component.scss']
})
export class PodiumComponent implements OnInit {
  @Input() courseId!: number;
  @Input() courseLevel: string = '';
  @Input() isTeacher: boolean = false; // ← NUEVA PROPIEDAD

  podiumEntries: PodiumEntry[] = [];
  isLoading = true;
  viewMode: 'course' | 'level' = 'course'; // ← SIEMPRE MOSTRAR CURSO COMPLETO POR DEFECTO

  private apiUrl = 'http://localhost:8080/api/podium';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPodium();
  }

  loadPodium() {
    this.isLoading = true;
    
    // ← SIEMPRE CARGAR PODIO DEL CURSO COMPLETO
    this.http.get<PodiumEntry[]>(`${this.apiUrl}/course/${this.courseId}`).subscribe({
      next: (entries) => {
        this.podiumEntries = entries;
        this.isLoading = false;
        console.log('✅ Podio cargado:', entries);
      },
      error: (error) => {
        console.error('❌ Error al cargar podio:', error);
        this.isLoading = false;
      }
    });
  }

  // ← MÉTODO ELIMINADO: toggleViewMode()
  // Ya no necesitamos alternar entre vistas

  getPodiumIcon(position: number): string {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  }

  getPodiumClass(position: number): string {
    switch (position) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return 'bronze';
      default: return 'default';
    }
  }

  getEmptyStateMessage(): string {
    // ← MENSAJES SEGÚN EL ROL
    if (this.isTeacher) {
      return 'Aún no hay estudiantes en el podio. Los estudiantes aparecerán aquí cuando completen retos y obtengan bonificaciones.';
    } else {
      return 'Sé el primero en resolver un reto y aparecer en el podio';
    }
  }

  getEmptyStateTitle(): string {
    // ← TÍTULOS SEGÚN EL ROL
    if (this.isTeacher) {
      return 'El podio está vacío';
    } else {
      return 'No hay retos completados aún';
    }
  }
}