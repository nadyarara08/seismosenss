import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', [Validators.required]]
    });
  }

  async register() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    try {
      await this.authService.register(
        this.credentials.value.email,
        this.credentials.value.password,
        this.credentials.value.displayName
      );
      await loading.dismiss();
      this.router.navigateByUrl('/dashboard', { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertCtrl.create({
        header: 'Registration failed',
        message: error.message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  get displayName() {
    return this.credentials.get('displayName');
  }
}
