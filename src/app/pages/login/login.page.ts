import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Masuk ke akun...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email, password } = this.loginForm.value;
        await this.firebaseService.login(email, password);
        
        await loading.dismiss();
        await this.showToast('Berhasil masuk!', 'success');
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        await loading.dismiss();
        await this.showToast(this.getErrorMessage(error), 'danger');
      }
    } else {
      await this.showToast('Mohon isi semua field dengan benar', 'warning');
    }
  }

  async onRegister() {
    this.router.navigate(['/register']);
  }

  async onForgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Password',
      message: 'Masukkan email Anda untuk reset password',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Kirim',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.firebaseService.resetPassword(data.email);
                await this.showToast('Email reset password telah dikirim!', 'success');
              } catch (error: any) {
                await this.showToast(this.getErrorMessage(error), 'danger');
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

    private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'Email tidak terdaftar';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/user-disabled':
        return 'Akun telah dinonaktifkan';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan, coba lagi nanti';
      default:
        return 'Terjadi kesalahan, coba lagi';
    }
  }
}