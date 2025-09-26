import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService, LoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,   // 👈 marca que es standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: LoginResponse | null = null;
  loading = true;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.user = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
        if (err?.status === 401) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
