import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  canActivate() {
    return this.authService.user$.pipe(
      take(1),
      map(user => {
        if (!user) {
          return true;
        }
        // If user is logged in, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
}
