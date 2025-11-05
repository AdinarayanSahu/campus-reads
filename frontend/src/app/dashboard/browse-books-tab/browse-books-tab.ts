import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { BorrowService } from '../../services/borrow.service';

@Component({
    selector: 'app-browse-books-tab',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './browse-books-tab.html',
    styleUrls: ['./browse-books-tab.css']
})
export class BrowseBooksTabComponent implements OnInit {

    books: any[] = [];
    filteredBooks: any[] = [];
    paginatedBooks: any[] = [];
    searchTerm: string = '';
    loading: boolean = false;
    errorMessage: string = '';

    currentPage: number = 1;
    itemsPerPage: number = 12;
    totalPages: number = 1;

    selectedBook: any = null;
    showBookDetails: boolean = false;

    borrowDays: number = 14;
    borrowing: boolean = false;
    borrowSuccess: string = '';
    borrowError: string = '';

    constructor(
        private bookService: BookService,
        private borrowService: BorrowService
    ) { }

    ngOnInit() {
        this.loadBooks();
    }

    loadBooks() {
        this.loading = true;
        this.errorMessage = '';

        this.bookService.getAllBooks().subscribe({
            next: (response) => {
                console.log('Books loaded:', response);
                this.books = response;
                this.filteredBooks = response;
                this.updatePagination();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading books:', error);
                this.errorMessage = 'Failed to load books. Please try again.';
                this.loading = false;
            }
        });
    }

    onSearch() {
        this.currentPage = 1;
        this.filterBooks();
    }

    filterBooks() {
        this.filteredBooks = this.books.filter(book => {
            const matchesSearch = !this.searchTerm ||
                book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                book.isbn.toLowerCase().includes(this.searchTerm.toLowerCase());
            return matchesSearch;
        });
        this.updatePagination();
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
        }
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedBooks = this.filteredBooks.slice(startIndex, endIndex);
    }
    
    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagination();
            document.querySelector('.books-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    getPageNumbers(): number[] {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        
        if (this.totalPages <= maxVisiblePages) {
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            let start = Math.max(1, this.currentPage - 2);
            let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
            
            if (end - start < maxVisiblePages - 1) {
                start = Math.max(1, end - maxVisiblePages + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    }

    openBookDetails(book: any) {
        this.selectedBook = book;
        this.showBookDetails = true;
        this.borrowSuccess = '';
        this.borrowError = '';
        this.borrowDays = 14;
    }

    closeBookDetails() {
        this.showBookDetails = false;
        this.selectedBook = null;
        this.borrowSuccess = '';
        this.borrowError = '';
    }
    
    borrowBook() {
        if (!this.selectedBook) return;
        
        this.borrowing = true;
        this.borrowError = '';
        this.borrowSuccess = '';
        
        let userId: number | null = null;
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userId = user.userId;
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }
        
        if (!userId) {
            this.borrowError = 'User not logged in. Please log in to borrow books.';
            this.borrowing = false;
            return;
        }
        
        const borrowRequest = {
            userId: userId,
            bookId: this.selectedBook.id,
            borrowDays: this.borrowDays
        };
        
        this.borrowService.borrowBook(borrowRequest).subscribe({
            next: (response: any) => {
                console.log('Borrow request sent successfully:', response);
                this.borrowSuccess = `Borrow request sent for "${this.selectedBook.title}"! The librarian will review your request.`;
                this.borrowing = false;
                this.loadBooks();
                setTimeout(() => {
                    this.closeBookDetails();
                }, 2000);
            },
            error: (error: any) => {
                console.error('Error sending borrow request:', error);
                this.borrowError = error.error?.error || 'Failed to send borrow request. Please try again.';
                this.borrowing = false;
            }
        });
    }

    getDefaultCover(book: any): string {
        return 'assets/icons/books.png';
    }
}
