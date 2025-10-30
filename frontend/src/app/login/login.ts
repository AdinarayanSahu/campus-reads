import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loginForm!: FormGroup;
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onLogin() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.controls[key].markAsTouched();
      });
      return;
    }

    const loginData = this.loginForm.value;
    
    this.authService.login(loginData).subscribe({
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
