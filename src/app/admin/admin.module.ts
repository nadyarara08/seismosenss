import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';
import { UserManagementComponent } from './user-management/user-management.component';
import { NewsManagementComponent } from './news-management/news-management.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { AdminGuard } from '../core/guards/admin.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminPage,
        canActivate: [AuthGuard, AdminGuard],
        children: [
          { path: 'users', component: UserManagementComponent },
          { path: 'news', component: NewsManagementComponent },
          { path: '', redirectTo: 'users', pathMatch: 'full' }
        ]
      }
    ])
  ],
  declarations: [
    AdminPage,
    UserManagementComponent,
    NewsManagementComponent
  ]
})
export class AdminModule {}
