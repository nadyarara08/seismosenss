import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '@app/core/services/auth.service';
import { User } from '@app/core/models/user.model';
import { first, takeUntil, finalize } from 'rxjs/operators';
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
  private loading?: HTMLIonLoadingElement;

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

    this.loading = await this.loadingCtrl.create({
      message: 'Loading users...'
    });
    await this.loading.present();

    this.authService.getAllUsers().pipe(
      first(),
      takeUntil(this.destroy$),
      finalize(() => {
        this.isLoading = false;
        if (this.loading) {
          this.loading.dismiss();
        }
      })
    ).subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
      },
      error: async (error) => {
        console.error('Error loading users:', error);
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Failed to load users. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  filterUsers(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter(user => 
      user.email.toLowerCase().includes(searchTerm) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchTerm))
    );
  }

  async updateUserRole(user: User, role: string) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating role...'
    });
    await loading.present();

    try {
      await this.authService.updateUserRole(user.uid, role);
      user.role = role;
      
      const toast = await this.toastCtrl.create({
        message: 'User role updated successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error updating user role:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to update user role. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }

  async confirmDeleteUser(user: User) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete ${user.email}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => this.deleteUser(user)
        }
      ]
    });
    await alert.present();
  }

  private async deleteUser(user: User) {
    const loading = await this.loadingCtrl.create({
      message: 'Deleting user...'
    });
    await loading.present();

    try {
      await this.authService.deleteUser(user.uid);
      this.users = this.users.filter(u => u.uid !== user.uid);
      this.filteredUsers = this.filteredUsers.filter(u => u.uid !== user.uid);
      
      const toast = await this.toastCtrl.create({
        message: 'User deleted successfully',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error deleting user:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to delete user. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      await loading.dismiss();
    }
  }
}