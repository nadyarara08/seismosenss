import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, IonicSlides } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class OnboardingPage {
  swiperModules = [IonicSlides];

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    autoplay: {
      delay: 3000,
    },
  };

  slides = [
    {
      title: 'Selamat Datang',
      description: 'Aplikasi monitoring gempa terintegrasi',
      image: 'assets/images/onboarding1.svg',
    },
    {
      title: 'Pantau Real-time',
      description: 'Dapatkan notifikasi gempa secara real-time',
      image: 'assets/images/onboarding2.svg',
    },
    {
      title: 'Siap Digunakan',
      description: 'Mulai pantau gempa di sekitar Anda',
      image: 'assets/images/onboarding3.svg',
    },
  ];

  constructor(private router: Router) {}

  skip() {
    this.router.navigate(['/auth/login']);
  }

  navigateTo(page: string) {
    this.router.navigate([`/auth/${page}`]);
  }

  onSlideChange(event: any) {
    console.log('Slide changed', event);
  }
}
