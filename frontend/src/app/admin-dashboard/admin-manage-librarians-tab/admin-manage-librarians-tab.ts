import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-manage-librarians-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  currentLibrarian: any = {
    name: '',
    email: '',
    password: '',
    gender: '',
    role: 'LIBRARIAN'
  };
  selectedLibrarian: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLibrarians();
  }

  loadLibrarians() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        // Filter only librarians
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
    this.currentLibrarian = {
      name: '',
      email: '',
      password: '',
      gender: '',
      role: 'LIBRARIAN'
    };
  }

  closeAddLibrarianForm() {
    this.showAddLibrarianForm = false;
    this.currentLibrarian = {
      name: '',
      email: '',
      password: '',
      gender: '',
      role: 'LIBRARIAN'
    };
  }

  addLibrarian() {
    if (!this.currentLibrarian.name || !this.currentLibrarian.email || !this.currentLibrarian.password || !this.currentLibrarian.gender) {
      alert('Please fill all required fields');
      return;
    }

    const librarianData = {
      name: this.currentLibrarian.name,
      email: this.currentLibrarian.email,
      password: this.currentLibrarian.password,
      gender: this.currentLibrarian.gender,
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
    this.showEditLibrarianForm = true;
  }

  closeEditLibrarianForm() {
    this.showEditLibrarianForm = false;
    this.selectedLibrarian = null;
  }

  updateLibrarian() {
    if (!this.selectedLibrarian.name || !this.selectedLibrarian.email || !this.selectedLibrarian.gender) {
      alert('Please fill all required fields');
      return;
    }

    const updatedData = {
      name: this.selectedLibrarian.name,
      email: this.selectedLibrarian.email,
      gender: this.selectedLibrarian.gender,
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
}
