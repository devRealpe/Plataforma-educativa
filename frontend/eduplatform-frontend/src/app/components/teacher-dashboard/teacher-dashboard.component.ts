// app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  bgColor: string;
}

interface Course {
  title: string;
  description: string;
  status: string;
  statusColor: string;
  students: number;
  exercises: number;
  challenges: number;
  inviteLink: string;
  exercisesList: Exercise[];
  challengesList: Challenge[];
}

interface Exercise {
  level: string;
  title: string;
  xp: number;
}

interface Challenge {
  difficulty: string;
  title: string;
  points: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.scss']
})
export class TeacherDashboardComponent {
  stats: StatCard[] = [
    {
      title: 'Cursos Activos',
      value: 1,
      icon: '📚',
      bgColor: '#bfdbfe'
    },
    {
      title: 'Estudiantes Totales',
      value: 24,
      icon: '👥',
      bgColor: '#a7f3d0'
    },
    {
      title: 'Ejercicios Creados',
      value: 1,
      icon: '🎯',
      bgColor: '#fde68a'
    },
    {
      title: 'Retos Activos',
      value: 1,
      icon: '🏆',
      bgColor: '#ddd6fe'
    }
  ];

  courses: Course[] = [
    {
      title: 'Matemáticas Avanzadas',
      description: 'Curso completo de álgebra y cálculo',
      status: 'Avanzado',
      statusColor: '#10b981',
      students: 24,
      exercises: 1,
      challenges: 1,
      inviteLink: 'https://mariana.learning/join/MTH-ADV-2024',
      exercisesList: [
        { level: 'Nivel 1', title: 'Ecuaciones Cuadráticas', xp: 100 }
      ],
      challengesList: [
        { difficulty: 'Difícil', title: 'Desafío de Integrales', points: 500 }
      ]
    }
  ];

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copiado al portapapeles');
    });
  }
}