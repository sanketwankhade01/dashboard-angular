import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
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

  constructor(private router: Router, private auth: AuthService) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    // Demo credentials
    if (this.email === 'admin@gmail.com' && this.password === 'admin') {
      this.errorMessage = '';
      this.auth.login({ username: 'admin', roles: ['Admin'], token: 'fake-jwt-token' });
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.email === 'manager@gmail.com' && this.password === 'manager') {
      this.errorMessage = '';
      this.auth.login({ username: 'manager', roles: ['Manager'], token: 'fake-jwt-token' });
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.email === 'user@gmail.com' && this.password === 'user') {
      this.errorMessage = '';
      this.auth.login({ username: 'user', roles: ['User'], token: 'fake-jwt-token' });
      this.router.navigate(['/dashboard']);
      return;
    }

    // ❌ wrong credentials
    this.errorMessage = 'Invalid email or password';
  }

  loginWithGoogle() {
    alert('Google login clicked!');
  }
}
