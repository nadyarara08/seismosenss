import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) {}

  // Easy access for form fields with proper typing
  get email(): AbstractControl | null {
    return this.credentials.get('email');
  }

  get password(): AbstractControl | null {
    return this.credentials.get('password');
  }

  ngOnInit() {
    // Form is already initialized in the property declaration
  }

  async login() {
    if (this.credentials.invalid) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Logging in...',
    });
    
    try {
      await loading.present();
      await this.authService.login(this.credentials.value);
      await loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error: unknown) {
      await loading.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      this.showAlert('Login Failed', errorMessage);
    }
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
