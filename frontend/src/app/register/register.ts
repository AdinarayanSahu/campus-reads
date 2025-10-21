import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  message = '';
  messageType: 'success' | 'error' | '' = '';

  registerData = {
    name: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) { }




  onRegister() {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.gender || !this.registerData.password || !this.registerData.confirmPassword) {
      this.message = 'Please fill all fields.';
      this.messageType = 'error';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.message = 'Passwords do not match.';
      this.messageType = 'error';
      return;
    }

    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.message = 'Registration successful! You can now log in.';
        this.messageType = 'success';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: () => {
        this.message = 'Registration failed. Please try again.';
        this.messageType = 'error';
      }
    });
  }
}
