import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component'; // ✅ correct import
import { RoleGuard } from './role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },

  // ✅ Correct route for User Management
  // { path: 'user-management', component: UserManagementComponent, canActivate: [RoleGuard], data: { roles: ['Admin'] } },
  // Route for Agent-only My Ticket page (re-uses UserManagementComponent)
  { path: 'my-ticket', component: UserManagementComponent, canActivate: [RoleGuard], data: { roles: ['Agent'] } },

  { path: '**', redirectTo: 'login' }
];


