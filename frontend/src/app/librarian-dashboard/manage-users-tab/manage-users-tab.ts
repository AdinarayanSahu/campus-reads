import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-manage-users-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users-tab.html',
  styleUrls: ['./manage-users-tab.css']
})
export class ManageUsersTabComponent implements OnInit {
  @Output() userCountUpdated = new EventEmitter<number>();

  users: any[] = [];
  filteredUsers: any[] = [];
  searchUserQuery: string = '';
  showAddUserForm: boolean = false;
  currentUser: any = {
    name: '',
    email: '',
    gender: '',
    mobile: '',
    role: 'USER',
    password: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        this.users = response.filter((user: any) => user.role === 'USER');
        this.filteredUsers = this.users;
        this.userCountUpdated.emit(this.users.length);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        if (error.status === 401 || error.status === 403) {
          alert('Session expired. Please login again.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          this.router.navigate(['/login']);
        } else {
          alert('Failed to load users. Error: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }

  searchUsers() {
    if (!this.searchUserQuery.trim()) {
      this.filteredUsers = this.users;
    } else {
      const query = this.searchUserQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.gender.toLowerCase().includes(query)
      );
    }
  }

  openAddUserForm() {
    this.showAddUserForm = true;
    this.currentUser = {
      name: '',
      email: '',
      gender: '',
      mobile: '',
      role: 'USER',
      password: ''
    };
  }

  closeAddUserForm() {
    this.showAddUserForm = false;
    this.currentUser = {
      name: '',
      email: '',
      gender: '',
      mobile: '',
      role: 'USER',
      password: ''
    };
  }

  addUser() {
    if (!this.validateUser()) {
      return;
    }

    if (!this.currentUser.password || !this.currentUser.password.trim()) {
      alert('Please enter a password.');
      return;
    }

    const userData = {
      name: this.currentUser.name,
      email: this.currentUser.email,
      gender: this.currentUser.gender,
      mobile: this.currentUser.mobile,
      password: this.currentUser.password,
      role: 'USER'
    };

    this.userService.registerUser(userData).subscribe({
      next: (response) => {
        alert('User registered successfully!');
        this.closeAddUserForm();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error registering user:', error);
        if (error.status === 401 || error.status === 403) {
          alert('Session expired. Please login again.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          this.router.navigate(['/login']);
        } else {
          alert('Failed to register user. Error: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }

  validateUser(): boolean {
    if (!this.currentUser.name.trim()) {
      alert('Please enter a name.');
      return false;
    }
    if (!this.currentUser.email.trim()) {
      alert('Please enter an email.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.currentUser.email)) {
      alert('Please enter a valid email address.');
      return false;
    }
    if (!this.currentUser.gender.trim()) {
      alert('Please select a gender.');
      return false;
    }
    return true;
  }
}
