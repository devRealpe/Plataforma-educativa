import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule,
    RouterLink
  ],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>

      <main class="main">
        <header class="topbar">
          <div class="left">
            <h1>¡Bienvenida, María González!</h1>
            <p class="subtitle">Continúa tu viaje de aprendizaje</p>
          </div>
          <div class="right">
            <div class="xp">
              <mat-icon>star</mat-icon>
              <span class="xp-value">2450 XP</span>
              <span class="level">Nivel 12</span>
            </div>
            <div class="avatar">
              <img src="assets/avatar.png" alt="avatar" />
              <span class="username">María González</span>
            </div>
          </div>
        </header>

        <!-- Stats row -->
        <section class="stats-grid">
          <mat-card class="stat-card" *ngFor="let s of stats">
            <div class="stat-title">{{ s.title }}</div>
            <div class="stat-value">{{ s.value }}</div>
            <div class="stat-sub">{{ s.sub }}</div>
          </mat-card>
        </section>

        <!-- Courses + Leaderboard -->
        <section class="content-grid">
          <div class="courses-panel">
            <mat-card>
              <div class="panel-header">
                <h3>Mis Cursos Recientes</h3>
                <a routerLink="/courses">Ver todos ›</a>
              </div>

              <div class="course-list">
                <div class="course-item" *ngFor="let c of courses">
                  <img class="thumb" [src]="c.image" alt="thumb"/>
                  <div class="info">
                    <div class="title">{{ c.title }}</div>
                    <div class="teacher">{{ c.teacher }}</div>
                    <mat-progress-bar mode="determinate" [value]="c.progress"></mat-progress-bar>
                  </div>
                  <div class="percent">{{ c.progress }}%</div>
                </div>
              </div>
            </mat-card>
          </div>

          <aside class="leaderboard">
            <mat-card>
              <h3>Top Estudiantes</h3>
              <div class="leader-list">
                <div class="leader-item" *ngFor="let t of topStudents; let i = index">
                  <div class="pos">{{ i + 1 }}</div>
                  <img class="ava" [src]="t.avatar" alt="ava"/>
                  <div class="info">
                    <div class="name">{{ t.name }}</div>
                    <div class="points">{{ t.points }} puntos</div>
                  </div>
                </div>
              </div>
            </mat-card>
          </aside>
        </section>

        <!-- Active Challenges -->
        <section class="challenges">
          <h3>Retos Activos</h3>
          <div class="challenge-list">
            <mat-card class="challenge" *ngFor="let r of challenges">
              <div class="ch-title">{{ r.title }}</div>
              <div class="ch-sub">{{ r.participants }} participantes</div>
              <div class="ch-footer">
                <button mat-flat-button color="primary">Participar</button>
                <div class="xp">+{{ r.xp }} XP</div>
              </div>
            </mat-card>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    /* Layout */
    .layout { display:flex; min-height:100vh; background:#f3f6fb; }
    .main {
      margin-left:240px; /* space for sidenav */
      padding: 1.5rem;
      width: calc(100% - 240px);
    }

    /* Topbar */
    .topbar {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:1rem;
      margin-bottom: 1rem;
    }
    .topbar h1 { margin:0; font-size:1.6rem; }
    .subtitle { color: #6b7280; margin:0.25rem 0 0; }

    .right { display:flex; align-items:center; gap:1rem; }
    .xp { display:flex; align-items:center; gap:0.5rem; background:#fff; padding:0.45rem 0.8rem; border-radius:999px; box-shadow:0 2px 8px rgba(16,24,40,0.04);}
    .xp mat-icon { color:#f59e0b; }
    .avatar { display:flex; align-items:center; gap:0.5rem; }
    .avatar img { width:40px; height:40px; border-radius:50%; }

    /* Stats grid */
    .stats-grid {
      display:grid;
      grid-template-columns: repeat(4, 1fr);
      gap:1rem;
      margin-bottom:1rem;
    }
    .stat-card { padding:1rem; border-radius:12px; }

    .stat-title { color:#6b7280; font-size:0.9rem; }
    .stat-value { font-size:1.4rem; font-weight:700; margin-top:0.35rem; }
    .stat-sub { color:#10b981; margin-top:0.35rem; font-size:0.85rem; }

    /* Content grid: courses + leaderboard */
    .content-grid { display:grid; grid-template-columns: 1fr 320px; gap:1rem; margin-bottom:1rem; }
    .courses-panel mat-card { padding:1rem; border-radius:12px; }
    .panel-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
    .panel-header a { color:#2563eb; text-decoration:none; }

    .course-list { display:flex; flex-direction:column; gap:1rem; }
    .course-item { display:flex; align-items:center; gap:1rem; padding:0.3rem 0; }
    .thumb { width:64px; height:48px; border-radius:6px; object-fit:cover; }
    .info { flex:1; }
    .title { font-weight:600; }
    .teacher { color:#6b7280; font-size:0.9rem; margin-bottom:0.45rem; }
    .percent { width:40px; text-align:right; color:#6b7280; }

    /* Leaderboard */
    .leaderboard mat-card { padding:1rem; border-radius:12px; }
    .leader-list { display:flex; flex-direction:column; gap:0.75rem; margin-top:0.5rem; }
    .leader-item { display:flex; align-items:center; gap:0.75rem; }
    .leader-item .pos { width:28px; height:28px; background:#fde68a; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700;}
    .leader-item .ava { width:36px; height:36px; border-radius:50%; object-fit:cover; }
    .leader-item .name { font-weight:600; }
    .leader-item .points { color:#6b7280; font-size:0.9rem; }

    /* Challenges */
    .challenges h3 { margin:0 0 0.6rem 0; }
    .challenge-list { display:flex; gap:1rem; }
    .challenge { width:100%; padding:1rem; border-radius:10px; display:flex; flex-direction:column; justify-content:space-between; }
    .ch-footer { display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem; }

    /* Responsive */
    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
      .main { margin-left: 0; width:100%; padding:1rem; }
      .layout app-sidebar { display:none; }
    }
  `]
})
export class DashboardComponent {
  stats = [
    { title: 'Cursos Activos', value: '3', sub: '+1 desde la semana pasada' },
    { title: 'Puntos Totales', value: '2450', sub: '+180 esta semana' },
    { title: 'Retos Completados', value: '12', sub: '+3 esta semana' },
    { title: 'Posición en Ranking', value: '#3', sub: 'Subiste 2 posiciones' },
  ];

  courses = [
    { title: 'Matemáticas Avanzadas', teacher: 'Prof. García', progress: 75, image: 'assets/course1.jpg' },
    { title: 'Historia Universal', teacher: 'Prof. López', progress: 45, image: 'assets/course2.jpg' },
    { title: 'Ciencias Naturales', teacher: 'Prof. Martín', progress: 90, image: 'assets/course3.jpg' },
  ];

  topStudents = [
    { name: 'Ana Rodríguez', points: 3250, avatar: 'assets/ava1.jpg' },
    { name: 'Carlos Mendoza', points: 3100, avatar: 'assets/ava2.jpg' },
    { name: 'María González', points: 2450, avatar: 'assets/ava3.jpg' },
  ];

  challenges = [
    { title: 'Desafío Matemático', participants: 234, xp: 150 },
    { title: 'Quiz de Historia', participants: 456, xp: 100 },
    { title: 'Experimento Científico', participants: 123, xp: 250 },
  ];
}
