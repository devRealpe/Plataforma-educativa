import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'student';

  constructor(private authService: AuthService, private router: Router) {}
  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const userData = {
      nombre: this.name,
      email: this.email,
      password: this.password,
      role: this.role.toUpperCase() // Convierte a mayúsculas
    };

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        alert('Usuario registrado correctamente');
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        alert('Error al registrar usuario');
      }
    });
  }
}
