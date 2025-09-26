import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  goToRegister() {
    this.router.navigate(['/register']);
  }

  onSubmit() {
    if (this.email && this.password) {
      const credentials = { email: this.email, password: this.password };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.snackBar.open('✅ Login exitoso', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.snackBar.open('❌ Credenciales incorrectas', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        },
      });
    }
  }
}
