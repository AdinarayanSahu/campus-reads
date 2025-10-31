import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-manage-librarians-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-manage-librarians-tab.html',
  styleUrls: ['./admin-manage-librarians-tab.css']
})
export class AdminManageLibrariansTabComponent implements OnInit {
  @Output() librarianCountUpdated = new EventEmitter<number>();

  librarians: any[] = [];
  filteredLibrarians: any[] = [];
  searchQuery: string = '';
  showAddLibrarianForm: boolean = false;
  showEditLibrarianForm: boolean = false;
  addLibrarianForm!: FormGroup;
  editLibrarianForm!: FormGroup;
  selectedLibrarian: any = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadLibrarians();
  }

  initializeForms() {

    this.addLibrarianForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.passwordStrengthValidator
      ]],
      gender: ['', Validators.required]
    });

    this.editLibrarianForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z\s]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      gender: ['', Validators.required]
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

  loadLibrarians() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        this.librarians = response.filter((user: any) => 
          user.role && user.role.toUpperCase() === 'LIBRARIAN'
        );
        this.filteredLibrarians = this.librarians;
        this.librarianCountUpdated.emit(this.librarians.length);
      },
      error: (error) => {
        console.error('Error loading librarians:', error);
        alert('Failed to load librarians. Please try again.');
      }
    });
  }

  searchLibrarians() {
    if (!this.searchQuery.trim()) {
      this.filteredLibrarians = this.librarians;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredLibrarians = this.librarians.filter(librarian =>
      librarian.name?.toLowerCase().includes(query) ||
      librarian.email?.toLowerCase().includes(query)
    );
  }

  openAddLibrarianForm() {
    this.showAddLibrarianForm = true;
    this.addLibrarianForm.reset();
  }

  closeAddLibrarianForm() {
    this.showAddLibrarianForm = false;
    this.addLibrarianForm.reset();
  }

  addLibrarian() {
    if (this.addLibrarianForm.invalid) {
      Object.keys(this.addLibrarianForm.controls).forEach(key => {
        this.addLibrarianForm.get(key)?.markAsTouched();
      });
      alert('Please fill all required fields correctly');
      return;
    }

    const librarianData = {
      name: this.addLibrarianForm.value.name,
      email: this.addLibrarianForm.value.email,
      password: this.addLibrarianForm.value.password,
      gender: this.addLibrarianForm.value.gender,
      role: 'LIBRARIAN'
    };

    this.userService.registerUser(librarianData).subscribe({
      next: (response) => {
        console.log('Librarian added successfully:', response);
        alert('Librarian added successfully!');
        this.closeAddLibrarianForm();
        this.loadLibrarians();
      },
      error: (error) => {
        console.error('Error adding librarian:', error);
        let errorMessage = 'Failed to add librarian. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Email already exists. Please use a different email.';
        }
        
        alert(errorMessage);
      }
    });
  }

  openEditLibrarianForm(librarian: any) {
    this.selectedLibrarian = { ...librarian };
    this.editLibrarianForm.patchValue({
      name: librarian.name,
      email: librarian.email,
      gender: librarian.gender
    });
    this.showEditLibrarianForm = true;
  }

  closeEditLibrarianForm() {
    this.showEditLibrarianForm = false;
    this.selectedLibrarian = null;
    this.editLibrarianForm.reset();
  }

  updateLibrarian() {
    if (this.editLibrarianForm.invalid) {
      Object.keys(this.editLibrarianForm.controls).forEach(key => {
        this.editLibrarianForm.get(key)?.markAsTouched();
      });
      alert('Please fill all required fields correctly');
      return;
    }

    const updatedData = {
      name: this.editLibrarianForm.value.name,
      email: this.editLibrarianForm.value.email,
      gender: this.editLibrarianForm.value.gender,
      role: 'LIBRARIAN'
    };

    this.userService.updateUser(this.selectedLibrarian.id, updatedData).subscribe({
      next: (response) => {
        console.log('Librarian updated successfully:', response);
        alert('Librarian updated successfully!');
        this.closeEditLibrarianForm();
        this.loadLibrarians();
      },
      error: (error) => {
        console.error('Error updating librarian:', error);
        let errorMessage = 'Failed to update librarian. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        alert(errorMessage);
      }
    });
  }

  deleteLibrarian(librarian: any) {
    if (confirm(`Are you sure you want to delete librarian "${librarian.name}"?`)) {
      this.userService.deleteUser(librarian.id).subscribe({
        next: () => {
          console.log('Librarian deleted successfully');
          alert('Librarian deleted successfully!');
          this.loadLibrarians();
        },
        error: (error) => {
          console.error('Error deleting librarian:', error);
          alert('Failed to delete librarian. Please try again.');
        }
      });
    }
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${fieldName} is required`;
    }

    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      return `${fieldName} must be at least ${requiredLength} characters`;
    }

    if (control.errors['pattern']) {
      return `${fieldName} should only contain letters and spaces`;
    }

    if (control.errors['email']) {
      return 'Please enter a valid email';
    }

    if (control.errors['passwordStrength']) {
      return 'Password must contain both letters and numbers';
    }
    
    return '';
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
