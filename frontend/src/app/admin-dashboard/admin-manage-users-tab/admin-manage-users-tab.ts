import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-manage-users-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  addUserForm!: FormGroup;
  editUserForm!: FormGroup;
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    if (typeof window !== 'undefined') {
      this.loadUsers();
    }
  }

  initializeForms() {
    this.addUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
      gender: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });

    this.editUserForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasNumber = /[0-9]/.test(value);
    const hasLetter = /[a-zA-Z]/.test(value);

    const passwordValid = hasNumber && hasLetter;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  get addFormFields() {
    return this.addUserForm.controls;
  }

  get editFormFields() {
    return this.editUserForm.controls;
  }

  loadUsers() {
    console.log('loadUsers called');
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('All users loaded:', response);
        console.log('Number of all users:', response.length);
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
    this.addUserForm.reset({
      name: '',
      email: '',
      password: '',
      gender: '',
      mobile: ''
    });
  }

  closeAddUserForm() {
    this.showAddUserForm = false;
    this.addUserForm.reset();
  }

  addUser() {
    if (this.addUserForm.invalid) {
      Object.keys(this.addUserForm.controls).forEach(key => {
        this.addUserForm.controls[key].markAsTouched();
      });
      return;
    }

    const userData = {
      ...this.addUserForm.value,
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
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      gender: user.gender,
      mobile: user.mobile
    });
    this.showEditUserForm = true;
  }

  closeEditUserForm() {
    this.showEditUserForm = false;
    this.selectedUser = null;
    this.editUserForm.reset();
  }

  updateUser() {
    if (this.editUserForm.invalid) {
      Object.keys(this.editUserForm.controls).forEach(key => {
        this.editUserForm.controls[key].markAsTouched();
      });
      return;
    }

    const updatedData = {
      ...this.editUserForm.value,
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
