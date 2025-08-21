import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.firebaseService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (!user) {
          return true;
        } else {
          this.router.navigate(['/dashboard']); // kalau sudah login, lempar ke dashboard
          return false;
        }
      })
    );
  }
}
