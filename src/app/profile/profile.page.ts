// profile.page.ts
import { Component, OnInit, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonAvatar,
  IonChip,
  IonBadge,
  IonSpinner,
  IonToast,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { AlertButton } from '@ionic/angular'; // penting untuk alertButtons

import { addIcons } from 'ionicons';
import { 
  personOutline, 
  lockClosedOutline, 
  chatbubbleOutline,
  informationCircleOutline,
  logOutOutline,
  chevronForwardOutline,
  arrowBackOutline,
  saveOutline,
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

// ====== Interfaces ======
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface ProfileData {
  devices: number;
  activeDays: number;
  dataUsage: string;
  displayName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ====== FirebaseService (mock) ======
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private userSubject = new BehaviorSubject<User | null>(null);
  private profileSubject = new BehaviorSubject<ProfileData | null>(null);

  private mockUser: User = {
    uid: 'user123',
    displayName: 'John Smith',
    email: 'john.smith@email.com',
    photoURL: null
  };

  private mockProfile: ProfileData = {
    devices: 3,
    activeDays: 156,
    dataUsage: '2.3GB',
    displayName: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z'
  };

  constructor() {
    // Simulasi auto-login
    setTimeout(() => {
      this.userSubject.next(this.mockUser);
      this.profileSubject.next(this.mockProfile);
    }, 1000);
  }

  get user$(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  get profile$(): Observable<ProfileData | null> {
    return this.profileSubject.asObservable();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.userSubject.next(null);
        this.profileSubject.next(null);
        resolve();
      }, 1000);
    });
  }

  async updateProfile(data: { displayName: string }): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = this.userSubject.value;
        const currentProfile = this.profileSubject.value;
        
        if (currentUser && currentProfile) {
          const updatedUser = { ...currentUser, displayName: data.displayName };
          const updatedProfile = { 
            ...currentProfile, 
            displayName: data.displayName,
            updatedAt: new Date().toISOString()
          };
          this.userSubject.next(updatedUser);
          this.profileSubject.next(updatedProfile);
        }
        resolve();
      }, 1000);
    });
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentPassword === 'wrongpassword') {
          reject(new Error('Password saat ini salah'));
        } else {
          resolve();
        }
      }, 1500);
    });
  }

  async loadProfileData(): Promise<ProfileData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockProfile);
      }, 500);
    });
  }
}

// ====== ProfilePage Component ======
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonAvatar,
    IonChip,
    IonBadge,
    IonSpinner,
    IonToast,
    IonAlert,
    IonGrid,
    IonRow,
    IonCol,
    IonSegment,
    IonSegmentButton
  ]
})
export class ProfilePage implements OnInit {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  // State
  user: User | null = null;
  profileData: ProfileData | null = null;
  currentSection: 'main' | 'editProfile' | 'security' = 'main';
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  // Form data
  editForm = { displayName: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  // Toast + Alert
  showToast = false;
  showAlert = false;
  toastMessage = '';
  alertMessage = '';
  alertButtons: AlertButton[] = [{ text: 'OK', role: 'cancel' }];

  constructor() {
    addIcons({
      personOutline,
      lockClosedOutline,
      chatbubbleOutline,
      informationCircleOutline,
      logOutOutline,
      chevronForwardOutline,
      arrowBackOutline,
      saveOutline,
      eyeOutline,
      eyeOffOutline
    });
  }

  ngOnInit() {
    this.firebaseService.user$.subscribe(user => {
      this.user = user;
      if (user) this.editForm.displayName = user.displayName || '';
    });

    this.firebaseService.profile$.subscribe(profile => {
      this.profileData = profile;
    });
  }

  getInitials(name: string | null): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  async handleLogout() {
    this.showAlert = true;
    this.alertMessage = 'Apakah Anda yakin ingin keluar dari akun?';
    this.alertButtons = [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Keluar',
        role: 'confirm',
        handler: async () => {
          this.loading = true;
          try {
            await this.firebaseService.signOut();
            this.showToastMessage('Berhasil keluar dari akun');
            await this.router.navigate(['/home']);
          } catch (error: any) {
            this.showToastMessage('Gagal keluar: ' + error.message);
          } finally {
            this.loading = false;
            this.showAlert = false;
          }
        }
      }
    ];
  }

  async handleEditProfile() {
    if (!this.editForm.displayName.trim()) {
      this.showToastMessage('Nama tidak boleh kosong');
      return;
    }
    this.loading = true;
    try {
      await this.firebaseService.updateProfile({ displayName: this.editForm.displayName });
      this.showToastMessage('Profil berhasil diperbarui');
      this.currentSection = 'main';
    } catch (error: any) {
      this.showToastMessage('Error: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  async handleChangePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.showToastMessage('Password baru tidak cocok');
      return;
    }
    if (this.passwordForm.newPassword.length < 6) {
      this.showToastMessage('Password minimal 6 karakter');
      return;
    }
    this.loading = true;
    try {
      await this.firebaseService.updatePassword(
        this.passwordForm.currentPassword,
        this.passwordForm.newPassword
      );
      this.showToastMessage('Password berhasil diubah');
      this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.currentSection = 'main';
    } catch (error: any) {
      this.showToastMessage('Error: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  showSection(section: 'main' | 'editProfile' | 'security') {
    this.currentSection = section;
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  handleSupportChat() {
    this.showToastMessage('Fitur chat support akan segera hadir!');
  }

  handleAboutInfo() {
    this.showToastMessage('SeismoSens v2.1.0 - Sistem Monitoring Seismik Terdepan');
  }
}