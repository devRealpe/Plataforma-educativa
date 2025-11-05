import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  isEditingProfile = false;
  isChangingPassword = false;
  
  profileMessage = '';
  profileError = '';
  passwordMessage = '';
  passwordError = '';
  
  isLoadingProfile = false;
  isLoadingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.initForms();
  }

  /**
   * Cargar datos del usuario
   */
  loadUserData() {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      // Si no hay usuario en memoria, intentar cargar desde el backend
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.user = user;
          this.profileForm.patchValue({ nombre: user.name });
        },
        error: (err) => {
          console.error('Error al cargar perfil:', err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.profileForm.patchValue({ nombre: this.user.name });
    }
  }

  /**
   * Inicializar formularios
   */
  initForms() {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validador para confirmar contraseña
   */
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Activar edición de perfil
   */
  enableProfileEdit() {
    this.isEditingProfile = true;
    this.profileMessage = '';
    this.profileError = '';
  }

  /**
   * Cancelar edición de perfil
   */
  cancelProfileEdit() {
    this.isEditingProfile = false;
    this.profileForm.patchValue({ nombre: this.user.name });
    this.profileMessage = '';
    this.profileError = '';
  }

  /**
   * Guardar cambios en el perfil
   */
  saveProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.isLoadingProfile = true;
    this.profileMessage = '';
    this.profileError = '';

    const nombre = this.profileForm.value.nombre;

    this.authService.updateProfile(nombre).subscribe({
      next: (response) => {
        this.profileMessage = '✅ Perfil actualizado exitosamente';
        this.user.name = response.name;
        this.isEditingProfile = false;
        this.isLoadingProfile = false;

        setTimeout(() => {
          this.profileMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.profileError = err.error?.error || 'Error al actualizar el perfil';
        this.isLoadingProfile = false;
      }
    });
  }

  /**
   * Activar cambio de contraseña
   */
  enablePasswordChange() {
    this.isChangingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';
    this.passwordForm.reset();
  }

  /**
   * Cancelar cambio de contraseña
   */
  cancelPasswordChange() {
    this.isChangingPassword = false;
    this.passwordForm.reset();
    this.passwordMessage = '';
    this.passwordError = '';
  }

  /**
   * Cambiar contraseña
   */
  changePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    this.isLoadingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        this.passwordMessage = '✅ Contraseña actualizada exitosamente';
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.isLoadingPassword = false;

        setTimeout(() => {
          this.passwordMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.passwordError = err.error?.error || 'Error al cambiar la contraseña';
        this.isLoadingPassword = false;
      }
    });
  }

  /**
   * Obtener icono según el rol
   */
  getRoleIcon(): string {
    return this.user?.role === 'TEACHER' ? '👨‍🏫' : '👨‍🎓';
  }

  /**
   * Obtener label del rol
   */
  getRoleLabel(): string {
    return this.user?.role === 'TEACHER' ? 'Profesor' : 'Estudiante';
  }

  /**
   * Obtener iniciales del nombre
   */
  getInitials(): string {
    if (!this.user?.name) return '?';
    
    const names = this.user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.user.name.substring(0, 2).toUpperCase();
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}