import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    
    // Usar isAuthenticated() 
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      // Si no hay token -> redirigir al login
      console.warn('🔒 Acceso denegado. Redirigiendo al login...');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url } // Guardar URL para redirigir después del login
      });
      return false;
    }
  }
}