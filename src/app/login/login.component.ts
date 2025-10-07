import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.email === 'admin@gmail.com' && this.password === 'admin') {
      // ✅ clear error
      this.errorMessage = '';

      // ✅ navigate to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // ❌ wrong credentials
      this.errorMessage = 'Invalid email or password';
    }
  }

  loginWithGoogle() {
    alert('Google login clicked!');
  }
}
