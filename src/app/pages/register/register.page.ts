// register.page.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const loading = await this.loadingCtrl.create({
        message: 'Membuat akun...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { name, email, password } = this.registerForm.value;
        const user = await this.firebaseService.register(email, password, name);
        
        await loading.dismiss();
        await this.showToast('Akun berhasil dibuat!', 'success');
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        await loading.dismiss();
        await this.showToast(this.getErrorMessage(error), 'danger');
      }
    } else {
      await this.showToast('Mohon isi semua field dengan benar', 'warning');
    }
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
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
      case 'auth/email-already-in-use':
        return 'Email sudah terdaftar';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/weak-password':
        return 'Password terlalu lemah';
      case 'auth/operation-not-allowed':
        return 'Registrasi tidak diizinkan';
      default:
        return 'Terjadi kesalahan, coba lagi';
    }
  }

  // Getter untuk validasi form
  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
}