import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  async login() {
    if (this.credentials.invalid) {
      return;
    }

    this.loading = true;
    const loading = await this.loadingController.create({
      message: 'Sedang masuk...',
      spinner: 'crescent'
    });
    
    try {
      await loading.present();
      await this.authService.login(
        this.credentials.value.email!,
        this.credentials.value.password!
      );
      
      await loading.dismiss();
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      this.loading = false;
      
      let errorMessage = 'Email atau password salah';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email atau password salah';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi nanti';
      } else if (error.message) {
        errorMessage = error.message;
      }

      const alert = await this.alertController.create({
        header: 'Gagal Masuk',
        message: errorMessage,
        buttons: ['OK']
      });
      
      await alert.present();
    }
  }
}
