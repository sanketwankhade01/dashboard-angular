import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginServiceService } from './login-service.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router, private loginService: LoginServiceService, private auth: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      return;
    }

    this.loginService.getEmpLogin(this.email, this.password).subscribe({
      next: (res: any) => {
        // Expecting backend to return token, roles and optional user info.
        const token = res?.token || res?.accessToken || null;

        // Backend may return a single role string or an array. Normalize to string[] and
        // map unknown roles to 'Agent' (we only support 'Admin' and 'Agent')
        let roles: string[] = [];
        const rawRole = res?.user?.App_Role || res?.user?.role || res?.role || null;
        if (Array.isArray(rawRole)) roles = rawRole.map(r => String(r));
        else if (rawRole) roles = [String(rawRole)];
        else roles = ['Agent'];

        // Normalize roles to canonical values: only 'Admin' or 'Agent'
        roles = roles.map(r => {
          const v = (r || '').toString().toLowerCase();
          return v === 'admin' ? 'Admin' : 'Agent';
        });

        const username = res?.user?.email || res?.user?.username || res?.email || 'anonymous';

        // Persist using AuthService
        this.auth.login({ username, roles, token });

        // Save session values in login service (Emp_ID, Emp_Name, Email_Id, Company_ID, App_Role)
        const sessionPayload = {
          Emp_ID: res?.user?.Emp_ID ?? res?.user?.id ?? res?.Emp_ID ?? null,
          Emp_Name: res?.user?.Emp_Name ?? res?.user?.name ?? res?.user?.username ?? username,
          Email_Id: res?.user?.Email_Id ?? res?.user?.email ?? res?.email ?? username,
          Company_ID: res?.user?.Company_ID ?? res?.user?.company ?? res?.Company_ID ?? null,
          App_Role: res?.user?.App_Role ?? roles
        };

        try { this.loginService.saveSession(sessionPayload); } catch (e) { /* swallow */ }

        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        console.error('Login error', err);
        this.errorMessage = err?.error?.message || 'Invalid email or password';
      }
    });
  }

  loginWithGoogle() {
    alert('Google login clicked!');
  }
}
