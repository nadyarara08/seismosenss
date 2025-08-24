import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  resetForm: FormGroup;
  isSubmitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.resetForm.get('email');
  }

  async onSubmit() {
    this.isSubmitted = true;
    
    if (!this.resetForm.valid) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Sending reset email...'
    });
    await loading.present();

    try {
      await this.authService.sendPasswordResetEmail(this.resetForm.value.email);
      
      const alert = await this.alertCtrl.create({
        header: 'Check Your Email',
        message: 'We have sent a password reset link to the email address you provided.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.router.navigate(['/auth/login']);
          }
        }]
      });
      
      await alert.present();
    } catch (error) {
      console.error('Password reset error:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error.message || 'Failed to send password reset email. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
