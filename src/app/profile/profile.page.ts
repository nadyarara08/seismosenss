import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class ProfilePage implements OnInit {
  user: any = {
    displayName: 'Pengguna',
    email: 'user@example.com',
    password: '123456', // dummy password
  };

  profileData: any = {
    devices: 0,
    activeDays: 0,
    dataUsage: 0,
  };

  currentSection: 'main' | 'editProfile' | 'security' = 'main';

  editForm: FormGroup;
  passwordForm: FormGroup;

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Form edit profil
    this.editForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
    });

    // Form ubah password
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    // Kalau ada data user tersimpan, pakai itu
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    this.editForm.patchValue({
      displayName: this.user.displayName || 'Pengguna'
    });
  }

  showSection(section: 'main' | 'editProfile' | 'security') {
    this.currentSection = section;
  }

  getInitials(name: string) {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // ----- Edit Profile -----
  async handleEditProfile() {
    if (this.editForm.invalid) return;
    this.isLoading = true;

    setTimeout(async () => {
      this.isLoading = false;
      this.user.displayName = this.editForm.value.displayName;

      // Simpan ke localStorage
      localStorage.setItem('user', JSON.stringify(this.user));

      await this.showToast('Profil berhasil diperbarui.');
      this.showSection('main');
    }, 1000);
  }

  // ----- Password -----
  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async handleChangePassword() {
    if (this.passwordForm.invalid) return;
    this.isLoading = true;

    setTimeout(async () => {
      this.isLoading = false;

      // Cek password saat ini (mock check)
      if (this.passwordForm.value.currentPassword !== this.user.password) {
        await this.showAlert('Password saat ini salah.');
        return;
      }

      // Update password user
      this.user.password = this.passwordForm.value.newPassword;
      localStorage.setItem('user', JSON.stringify(this.user));

      await this.showToast('Password berhasil diubah.');
      this.passwordForm.reset();
      this.showSection('main');
    }, 1000);
  }

  // ----- Support -----
  async handleSupportChat() {
    await this.showAlert('Hubungi support di: support@seismosens.com');
  }

  async handleAboutInfo() {
    await this.showAlert('SeismoSens v2.1.0\nTim Pengembang 2025');
  }

  // ----- Logout -----
  async handleLogout() {
    const alert = await this.alertController.create({
      header: 'Konfirmasi Logout',
      message: 'Yakin ingin keluar dari akun?',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Keluar',
          handler: async () => {
            this.isLoading = true;
            setTimeout(async () => {
              this.isLoading = false;
              localStorage.removeItem('user');
              await this.showToast('✅ Berhasil logout!');
              this.router.navigateByUrl('/home', { replaceUrl: true });
            }, 1000);
          }
        }
      ]
    });
    await alert.present();
  }

  onScroll(event: any){
    console.log('scrolling...', event);
  }

  // ----- Helpers -----
  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    await toast.present();
  }

  private async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Info',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
