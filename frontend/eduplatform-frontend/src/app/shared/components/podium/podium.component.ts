import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class PodiumComponent implements OnInit, OnChanges {
  @Input() courseId!: number;
  @Input() courseLevel: string = '';
  @Input() isTeacher: boolean = false;

  podiumEntries: PodiumEntry[] = [];
  isLoading = true;
  viewMode: 'course' | 'level' = 'course';

  private apiUrl = 'http://localhost:8080/api/podium';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    console.log('🏆 PodiumComponent ngOnInit');
    console.log('   courseId:', this.courseId);
    console.log('   courseLevel:', this.courseLevel);
    console.log('   isTeacher:', this.isTeacher);
    
    if (!this.courseId) {
      console.error('❌ PodiumComponent: courseId es undefined o null!');
      this.isLoading = false;
      return;
    }
    
    this.loadPodium();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('🔄 PodiumComponent ngOnChanges:', changes);
    
    if (changes['courseId'] && !changes['courseId'].firstChange) {
      console.log('   courseId cambió de', changes['courseId'].previousValue, 'a', changes['courseId'].currentValue);
      this.loadPodium();
    }
  }

  loadPodium() {
    console.log('\n📡 Cargando podio del curso:', this.courseId);
    console.log('   URL:', `${this.apiUrl}/course/${this.courseId}`);
    
    this.isLoading = true;
    
    this.http.get<PodiumEntry[]>(`${this.apiUrl}/course/${this.courseId}`).subscribe({
      next: (entries) => {
        console.log('✅ Podio recibido del backend:', entries);
        console.log('   Cantidad de estudiantes:', entries.length);
        
        if (entries.length > 0) {
          console.log('   Top 3:');
          entries.slice(0, 3).forEach((entry, index) => {
            console.log(`      ${index + 1}. ${entry.studentName} - ${entry.totalBonusPoints} XP`);
          });
        }
        
        this.podiumEntries = entries;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar podio:', error);
        console.error('   Status:', error.status);
        console.error('   Message:', error.message);
        console.error('   Error completo:', error);
        this.isLoading = false;
      }
    });
  }

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
    if (this.isTeacher) {
      return 'Aún no hay estudiantes en el podio. Los estudiantes aparecerán aquí cuando completen retos y obtengan bonificaciones.';
    } else {
      return 'Sé el primero en resolver un reto y aparecer en el podio';
    }
  }

  getEmptyStateTitle(): string {
    if (this.isTeacher) {
      return 'El podio está vacío';
    } else {
      return 'No hay retos completados aún';
    }
  }
}