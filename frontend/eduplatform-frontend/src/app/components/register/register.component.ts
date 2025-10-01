import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PrivacyModalComponent } from '../privacy-modal/privacy-modal.component';
import { TermsModalComponent } from '../terms-modal/terms-modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    MatSnackBarModule,
    CommonModule,
    PrivacyModalComponent,
    TermsModalComponent,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  role: string = 'student'; // valor por defecto

  // ✅ Nueva propiedad para el checkbox
  termsAccepted: boolean = false;

  // Estados de los modales
  isPrivacyOpen = false;
  isTermsOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  // Selección de rol
  selectRole(selectedRole: string) {
    this.role = selectedRole;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // --- Modal de Privacidad ---
  openPrivacyModal(event: Event) {
    event.preventDefault();
    this.isPrivacyOpen = true;
  }

  onPrivacyClosed() {
    this.isPrivacyOpen = false;
  }

  onPrivacyAccepted() {
    this.isPrivacyOpen = false;
  }

  // --- Modal de Términos ---
  openTermsModal(event: Event) {
    event.preventDefault();
    this.isTermsOpen = true;
  }

  onTermsClosed() {
    this.isTermsOpen = false;
  }

  onTermsAccepted() {
    this.isTermsOpen = false;
    this.termsAccepted = true; // Marca el checkbox automáticamente
    console.log('El usuario aceptó los términos de servicio');
  }

  // --- Registro ---
  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.snackBar.open('❌ Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }

    if (!this.termsAccepted) {
      this.snackBar.open(
        '⚠️ Debes aceptar los términos y condiciones para registrarte',
        'Cerrar',
        { duration: 3000, panelClass: ['snackbar-warning'] }
      );
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

        const errorMessage = err.error?.message || 'Error al registrar usuario';

        this.snackBar.open(`❌ ${errorMessage}`, 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }
}
