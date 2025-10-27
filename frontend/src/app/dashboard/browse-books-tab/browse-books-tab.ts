import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';

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
    searchTerm: string = '';
    selectedCategory: string = 'all';
    categories: string[] = ['all'];
    loading: boolean = false;
    errorMessage: string = '';

    constructor(private bookService: BookService) { }

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
                this.extractCategories();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading books:', error);
                this.errorMessage = 'Failed to load books. Please try again.';
                this.loading = false;
            }
        });
    }

    extractCategories() {
        const categorySet = new Set<string>(['all']);
        this.books.forEach(book => {
            if (book.category) {
                categorySet.add(book.category);
            }
        });
        this.categories = Array.from(categorySet);
    }

    onSearch() {
        this.filterBooks();
    }

    onCategoryChange() {
        this.filterBooks();
    }

    filterBooks() {
        this.filteredBooks = this.books.filter(book => {
            const matchesSearch = !this.searchTerm ||
                book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                book.isbn.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesCategory = this.selectedCategory === 'all' ||
                book.category === this.selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }

    getDefaultCover(book: any): string {
        return 'assets/icons/books.png';
    }
}
