import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  credentials: FormGroup<{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController
  ) {
    this.credentials = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Easy access for form fields
  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  get name() {
    return this.credentials.get('name');
  }

  ngOnInit() {}

  async register() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.authService.register(
        this.credentials.value.email!,
        this.credentials.value.password!,
        this.credentials.value.name!
      );
      await loading.dismiss();
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error: unknown) {
      await loading.dismiss();
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat melakukan registrasi. Silakan coba lagi.';
      const alert = await this.alertController.create({
        header: 'Registrasi gagal',
        message: errorMessage,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
