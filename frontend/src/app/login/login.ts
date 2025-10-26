import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loginData = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.message = 'Please fill all fields.';
      this.messageType = 'error';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.message = 'Login successful! Redirecting...';
        this.messageType = 'success';
        localStorage.setItem('user', JSON.stringify(response));
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
        setTimeout(() => {
          if (response && response.role && response.role.toUpperCase() === 'LIBRARIAN') {
            this.router.navigate(['/librarian-dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1200);
      },
      error: () => {
        this.message = 'Login failed. Please check your credentials.';
        this.messageType = 'error';
      }
    });
  }
}
