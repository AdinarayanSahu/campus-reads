import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

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
        
        setTimeout(() => {
          if (response && response.role) {
            const role = response.role.toUpperCase();
            
            if (this.returnUrl && this.returnUrl !== '/dashboard') {
              this.router.navigateByUrl(this.returnUrl);
            } else {
              if (role === 'ADMIN') {
                this.router.navigate(['/admin-dashboard']);
              } else if (role === 'LIBRARIAN') {
                this.router.navigate(['/librarian-dashboard']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }
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
