import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, MatSnackBarModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'student';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.snackBar.open('❌ Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }

    const userData = {
      nombre: this.name,
      email: this.email,
      password: this.password,
      role: this.role.toUpperCase(),
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('✅ Registration successful:', response);
        this.snackBar.open('🎉 Usuario registrado con éxito', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('❌ Registration error:', err);

        // 👇 Captura el mensaje del backend
        const errorMessage = err.error?.message || 'Error al registrar usuario';

        this.snackBar.open(`❌ ${errorMessage}`, 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }
}
