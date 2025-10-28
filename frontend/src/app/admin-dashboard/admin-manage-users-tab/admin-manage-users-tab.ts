import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-manage-users-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage-users-tab.html',
  styleUrls: ['./admin-manage-users-tab.css']
})
export class AdminManageUsersTabComponent implements OnInit {
  @Output() userCountUpdated = new EventEmitter<number>();

  users: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';
  showAddUserForm: boolean = false;
  showEditUserForm: boolean = false;
  currentUser: any = {
    name: '',
    email: '',
    password: '',
    gender: '',
    role: 'USER'
  };
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.loadUsers();
    }
  }

  loadUsers() {
    console.log('loadUsers called');
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('All users loaded:', response);
        console.log('Number of all users:', response.length);
        // Filter only regular users (not admin or librarian)
        this.users = response.filter((user: any) => 
          user.role && user.role.toUpperCase() === 'USER'
        );
        console.log('Filtered USER role users:', this.users);
        console.log('Number of USER role users:', this.users.length);
        this.filteredUsers = this.users;
        this.userCountUpdated.emit(this.users.length);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        if (typeof window !== 'undefined') {
          alert('Failed to load users. Please try again.');
        }
      }
    });
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  }

  openAddUserForm() {
    this.showAddUserForm = true;
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      gender: '',
      role: 'USER'
    };
  }

  closeAddUserForm() {
    this.showAddUserForm = false;
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      gender: '',
      role: 'USER'
    };
  }

  addUser() {
    if (!this.currentUser.name || !this.currentUser.email || !this.currentUser.password || !this.currentUser.gender) {
      if (typeof window !== 'undefined') {
        alert('Please fill all required fields');
      }
      return;
    }

    const userData = {
      name: this.currentUser.name,
      email: this.currentUser.email,
      password: this.currentUser.password,
      gender: this.currentUser.gender,
      role: 'USER'
    };

    this.userService.registerUser(userData).subscribe({
      next: (response) => {
        console.log('User added successfully:', response);
        if (typeof window !== 'undefined') {
          alert('User added successfully!');
        }
        this.closeAddUserForm();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error adding user:', error);
        let errorMessage = 'Failed to add user. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Email already exists. Please use a different email.';
        }
        
        if (typeof window !== 'undefined') {
          alert(errorMessage);
        }
      }
    });
  }

  openEditUserForm(user: any) {
    this.selectedUser = { ...user };
    this.showEditUserForm = true;
  }

  closeEditUserForm() {
    this.showEditUserForm = false;
    this.selectedUser = null;
  }

  updateUser() {
    if (!this.selectedUser.name || !this.selectedUser.email || !this.selectedUser.gender) {
      if (typeof window !== 'undefined') {
        alert('Please fill all required fields');
      }
      return;
    }

    const updatedData = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      gender: this.selectedUser.gender,
      role: 'USER'
    };

    this.userService.updateUser(this.selectedUser.id, updatedData).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        if (typeof window !== 'undefined') {
          alert('User updated successfully!');
        }
        this.closeEditUserForm();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        let errorMessage = 'Failed to update user. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        if (typeof window !== 'undefined') {
          alert(errorMessage);
        }
      }
    });
  }

  deleteUser(user: any) {
    if (typeof window !== 'undefined' && confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
          if (typeof window !== 'undefined') {
            alert('User deleted successfully!');
          }
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          if (typeof window !== 'undefined') {
            alert('Failed to delete user. Please try again.');
          }
        }
      });
    }
  }
}
