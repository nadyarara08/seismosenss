import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class ForgotPasswordPage {
  resetForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() { return this.resetForm.get('email'); }

  async onSubmit() {
    if (this.resetForm.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Sending reset email...' });
    await loading.present();

    try {
      await this.authService.sendPasswordReset(this.resetForm.value.email);

      const alert = await this.alertCtrl.create({
        header: 'Check Your Email',
        message: 'We have sent a password reset link to your email address.',
        buttons: [{
          text: 'OK',
          handler: () => this.router.navigate(['/auth/login'])
        }]
      });
      await alert.present();
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: error?.message || 'Failed to send reset email. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
