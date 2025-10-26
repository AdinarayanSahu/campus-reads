import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-librarian-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './librarian-dashboard.html',
  styleUrls: ['./librarian-dashboard.css']
})
export class LibrarianDashboardComponent implements OnInit {
  user: any = null;
  activeTab: string = 'overview';
  
  stats = {
    totalBooks: 0,
    issuedBooks: 0,
    totalUsers: 0,
    pendingRequests: 0
  };

  books: any[] = [];
  showAddBookForm: boolean = false;
  showEditBookForm: boolean = false;
  currentBook: any = {
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    coverImage: ''
  };
  selectedBook: any = null;
  searchQuery: string = '';
  filteredBooks: any[] = [];

  // User management properties
  users: any[] = [];
  filteredUsers: any[] = [];
  searchUserQuery: string = '';
  showAddUserForm: boolean = false;
  currentUser: any = {
    name: '',
    email: '',
    gender: '',
    role: 'USER',
    password: ''
  };

  constructor(
    private router: Router,
    private bookService: BookService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (typeof window === 'undefined') {
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      if (!this.user.role || this.user.role.toUpperCase() !== 'LIBRARIAN') {
        this.router.navigate(['/dashboard']);
        return;
      }
    } else {
      this.router.navigate(['/login']);
      return;
    }

    this.loadBooks();
    this.loadUsers();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    }
  }

  loadBooks() {
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        console.log('Books loaded:', response);
        this.books = response;
        this.filteredBooks = response;
        this.stats.totalBooks = response.length;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        if (error.status === 401 || error.status === 403) {
          alert('Session expired. Please login again.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          this.router.navigate(['/login']);
        } else {
          alert('Failed to load books. Error: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }

  searchBooks() {
    if (!this.searchQuery.trim()) {
      this.filteredBooks = this.books;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredBooks = this.books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      );
    }
  }

  openAddBookForm() {
    this.showAddBookForm = true;
    this.currentBook = {
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: 1,
      availableCopies: 1,
      coverImage: ''
    };
  }

  closeAddBookForm() {
    this.showAddBookForm = false;
  }

  addBook() {
    if (!this.validateBook()) {
      return;
    }

    console.log('Adding book:', this.currentBook);
    this.bookService.addBook(this.currentBook).subscribe({
      next: (response) => {
        console.log('Book added:', response);
        alert('Book added successfully!');
        this.closeAddBookForm();
        this.loadBooks();
      },
      error: (error) => {
        console.error('Error adding book:', error);
        if (error.status === 401 || error.status === 403) {
          alert('Session expired. Please login again.');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          this.router.navigate(['/login']);
        } else {
          alert('Failed to add book. Error: ' + (error.error?.message || error.message || 'Unknown error'));
        }
      }
    });
  }

  openEditBookForm(book: any) {
    this.showEditBookForm = true;
    this.selectedBook = book;
    this.currentBook = { ...book };
  }

  closeEditBookForm() {
    this.showEditBookForm = false;
    this.selectedBook = null;
  }

  updateBook() {
    if (!this.validateBook()) {
      return;
    }

    this.bookService.updateBook(this.selectedBook.id, this.currentBook).subscribe({
      next: (response) => {
        alert('Book updated successfully!');
        this.closeEditBookForm();
        this.loadBooks();
      },
      error: (error) => {
        console.error('Error updating book:', error);
        alert('Failed to update book. Please try again.');
      }
    });
  }

  deleteBook(bookId: number) {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    this.bookService.deleteBook(bookId).subscribe({
      next: (response) => {
        this.books = this.books.filter(book => book.id !== bookId);
        this.filteredBooks = this.filteredBooks.filter(book => book.id !== bookId);
        alert('Book deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting book:', error);
        if (error.status === 200 || error.status === 204) {
          this.books = this.books.filter(book => book.id !== bookId);
          this.filteredBooks = this.filteredBooks.filter(book => book.id !== bookId);
          alert('Book deleted successfully!');
        } else {
          alert('Failed to delete book. Please try again.');
        }
      }
    });
  }

  validateBook(): boolean {
    if (!this.currentBook.title.trim()) {
      alert('Please enter a book title.');
      return false;
    }
    if (!this.currentBook.author.trim()) {
      alert('Please enter an author name.');
      return false;
    }
    if (!this.currentBook.isbn.trim()) {
      alert('Please enter an ISBN.');
      return false;
    }
    if (!this.currentBook.category.trim()) {
      alert('Please enter a category.');
      return false;
    }
    if (this.currentBook.totalCopies < 1) {
      alert('Total copies must be at least 1.');
      return false;
    }
    if (this.currentBook.availableCopies < 0 || this.currentBook.availableCopies > this.currentBook.totalCopies) {
      alert('Available copies must be between 0 and total copies.');
      return false;
    }
    return true;
  }

  // User Management Methods
  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        // Filter to show only users with USER role
        this.users = response.filter((user: any) => user.role === 'USER');
        this.filteredUsers = this.users;
        this.stats.totalUsers = this.users.length;
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
    // Basic email validation
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

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}
