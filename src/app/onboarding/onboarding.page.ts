import { Component, OnInit } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {
  // Use IonicSlides for the slides
  swiperModules = [IonicSlides];
  
  // Optional: Configure slide options
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

  ngOnInit() {}

  skip() {
    this.router.navigate(['/login']);
  }

  onSlideChange(event: any) {
    // Handle slide change if needed
    console.log('Slide changed', event);
  }
}
