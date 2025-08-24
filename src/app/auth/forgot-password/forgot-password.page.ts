import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  credentials: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async resetPassword() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {
      await this.authService.sendPasswordResetEmail(this.credentials.value.email);
      await loading.dismiss();
      
      const alert = await this.alertCtrl.create({
        header: 'Password Reset Email Sent',
        message: 'Please check your email for instructions to reset your password.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.router.navigateByUrl('/login');
          }
        }]
      });
      await alert.present();
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  get email() {
    return this.credentials.get('email');
  }
}
