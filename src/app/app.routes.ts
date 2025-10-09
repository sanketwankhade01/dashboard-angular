import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component'; // ✅ correct import
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Protected user management route - Admins and Managers can access
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin','Manager'] } },

  { path: '**', redirectTo: 'login' }
];


