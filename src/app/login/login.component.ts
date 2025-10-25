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
  // Backend may return a single role string or an array. Normalize to string[]
  let roles: string[] = [];
  const rawRole = res?.user?.App_Role || res?.user?.role || res?.role || null;
  if (Array.isArray(rawRole)) roles = rawRole;
  else if (rawRole) roles = [rawRole];
  else roles = ['User'];

  const username = res?.user?.email || res?.user?.username || res?.email || 'anonymous';

  // Persist using AuthService
  this.auth.login({ username, roles, token });
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
