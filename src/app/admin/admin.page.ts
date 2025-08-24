import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  activeSegment: 'users' | 'news' = 'users';
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.userEmail = user.email;
      }
    });
  }

  segmentChanged(event: any) {
    this.activeSegment = event.detail.value;
    this.router.navigate(['/admin', this.activeSegment]);
  }

  onLogout() {
    this.authService.signOut();
  }
}
