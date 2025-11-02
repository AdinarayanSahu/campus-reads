import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-admin-manage-books-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-manage-books-tab.html',
  styleUrls: ['./admin-manage-books-tab.css']
})
export class AdminManageBooksTabComponent implements OnInit {
  isIsbnNotNumeric(isbn: string): boolean {
    return !!isbn && !/^\d+$/.test(isbn);
  }
  @Output() bookCountUpdated = new EventEmitter<number>();

  books: any[] = [];
  filteredBooks: any[] = [];
  searchQuery: string = '';
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

  constructor(
    private bookService: BookService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.bookService.getAllBooks().subscribe({
      next: (response) => {
        console.log('Books loaded:', response);
        this.books = response;
        this.filteredBooks = response;
        this.bookCountUpdated.emit(response.length);
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
        this.bookCountUpdated.emit(this.books.length);
      },
      error: (error) => {
        console.error('Error deleting book:', error);
        if (error.status === 200 || error.status === 204) {
          this.books = this.books.filter(book => book.id !== bookId);
          this.filteredBooks = this.filteredBooks.filter(book => book.id !== bookId);
          alert('Book deleted successfully!');
          this.bookCountUpdated.emit(this.books.length);
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
}
