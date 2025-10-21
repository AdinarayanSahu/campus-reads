import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginData = {
    username: '', // can be email or username
    password: ''
  };

  onLogin() {
    if (!this.loginData.username || !this.loginData.password) {
      alert('Please fill all fields');
      return;
    }

    console.log('Login Data:', this.loginData);
    alert('Login Successful!');
  }
}
