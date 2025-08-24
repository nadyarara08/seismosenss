import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService, User } from '../../services/auth.service';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadUsers() {
    if (this.isLoading) return;
    this.isLoading = true;

    const loading = await this.loadingCtrl.create({
      message: 'Loading users...'
    });
    await loading.present();

    try {
      this.authService.getAllUsers().pipe(
        first(),
        takeUntil(this.destroy$)
      ).subscribe(users => {
        this.users = users;
        this.filteredUsers = [...users];
      });
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Failed to load users');
    } finally {
      await loading.dismiss();
      this.isLoading = false;
    }
  }

  async updateUserRole(user: User, role: 'user' | 'admin') {
    if (user.role === role) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirm Role Change',
      message: `Change ${user.email}'s role to ${role}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: async () => {
            const loading = await this.loadingCtrl.create({
              message: 'Updating user role...'
            });
            await loading.present();

            try {
              await this.authService.updateUserRole(user, role);
              this.showToast(`Updated ${user.email}'s role to ${role}`);
            } catch (error) {
              console.error('Error updating user role:', error);
              this.showError('Failed to update user role');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async showError(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger'
    });
    await toast.present();
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'success'
    });
    await toast.present();
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      return user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }
}