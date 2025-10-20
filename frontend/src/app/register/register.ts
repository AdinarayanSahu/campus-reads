import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerData = {
    name: '',
    email: '',
    password: ''
  };

  onRegister() {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      alert('Please fill all fields');
      return;
    }

    console.log('Registration Data:', this.registerData);
    alert('Registration Successful!');
  }
}
