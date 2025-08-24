import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email(): AbstractControl | null {
    return this.credentials.get('email');
  }

  get password(): AbstractControl | null {
    return this.credentials.get('password');
  }

  async login() {
    if (this.credentials.invalid) {
      return;
    }

    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {
      await this.authService.login(
        this.credentials.value.email,
        this.credentials.value.password
      );
      await loading.dismiss();
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (error: any) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Login failed',
        message: error.message || 'An unknown error occurred',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
