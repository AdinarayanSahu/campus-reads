import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerData = {
    username: '',
    name: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: ''
  };

  usernameStatus = '';

  checkUsername() {
    if (!this.registerData.username) {
      this.usernameStatus = 'Please enter a username';
      return;
    }

    // Simulate checking username availability
    const unavailableUsernames = ['admin', 'user', 'test', 'student', 'library'];
    
    if (unavailableUsernames.includes(this.registerData.username.toLowerCase())) {
      this.usernameStatus = 'Username not available';
    } else {
      this.usernameStatus = 'Username available';
    }
  }

  onRegister() {
    if (!this.registerData.username || !this.registerData.name || !this.registerData.email || !this.registerData.password) {
      alert('Please fill all fields');
      return;
    }

    console.log('Registration Data:', this.registerData);
    alert('Registration Successful!');
  }
}
