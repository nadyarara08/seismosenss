import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class RegisterPage {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.matchPasswords('password', 'confirmPassword') });
  }

  private matchPasswords(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const pw = formGroup.get(password);
      const cpw = formGroup.get(confirmPassword);
      if (pw && cpw && pw.value !== cpw.value) {
        cpw.setErrors({ mismatch: true });
      } else {
        cpw?.setErrors(null);
      }
    };
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Creating account...' });
    await loading.present();

    try {
      await this.authService.register(
        this.registerForm.value.email,
        this.registerForm.value.password,
        this.registerForm.value.name
      );

      const alert = await this.alertCtrl.create({
        header: 'Registration Successful',
        message: 'Please check your email to verify your account.',
        buttons: [{
          text: 'OK',
          handler: () => this.router.navigate(['/auth/login'])
        }]
      });
      await alert.present();
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Registration Failed',
        message: error?.message || 'Could not register. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}
