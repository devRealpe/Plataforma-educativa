import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <aside class="sidenav">
      <div class="brand">
        <mat-icon>school</mat-icon>
        <span class="brand-title">Mariana Learning</span>
      </div>

      <nav class="nav">
        <a routerLink="/dashboard" class="nav-item"><mat-icon>dashboard</mat-icon><span>Dashboard</span></a>
        <a routerLink="/profile" class="nav-item"><mat-icon>person</mat-icon><span>Mi Perfil</span></a>
        <a routerLink="/courses" class="nav-item"><mat-icon>menu_book</mat-icon><span>Cursos</span></a>
        <a routerLink="/podium" class="nav-item"><mat-icon>emoji_events</mat-icon><span>Podio</span></a>
        <a routerLink="/challenges" class="nav-item"><mat-icon>flag</mat-icon><span>Retos</span></a>
        <a routerLink="/my-courses" class="nav-item"><mat-icon>folder</mat-icon><span>Mis Cursos</span></a>
      </nav>
    </aside>
  `,
  styles: [`
    .sidenav {
      width: 240px;
      background: #0f172a;
      color: #fff;
      height: 100vh;
      padding: 1rem 0.75rem;
      box-sizing: border-box;
      position: fixed;
      left: 0;
      top: 0;
    }
    .brand {
      display:flex;
      align-items:center;
      gap:0.5rem;
      padding:0 0.25rem 1rem 0.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      margin-bottom: 0.75rem;
    }
    .brand mat-icon { color:#8b9bf6; }
    .brand-title { font-weight:600; font-size:1.05rem; color:#e6eefc; }
    .nav { display:flex; flex-direction:column; gap:0.25rem; margin-top:1rem; }
    .nav-item {
      display:flex;
      align-items:center;
      gap:0.75rem;
      padding:0.65rem;
      color: rgba(255,255,255,0.9);
      border-radius:8px;
      text-decoration:none;
    }
    .nav-item mat-icon { color: rgba(255,255,255,0.7); }
    .nav-item:hover { background: rgba(255,255,255,0.03); }
  `]
})
export class SidebarComponent {}
