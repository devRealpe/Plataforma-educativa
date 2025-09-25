import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (this.email && this.password) {
      const credentials = { email: this.email, password: this.password };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('✅ Login exitoso:', response);
          alert('Login exitoso');
          // Aquí podemos guardar el token en localStorage más adelante
        },
        error: (err) => {
          console.error('❌ Error en login:', err);
          alert('Credenciales incorrectas');
        }
      });
    }
  }
}
