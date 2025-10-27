import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BorrowService } from '../../services/borrow.service';

@Component({
  selector: 'app-my-books-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-books-tab.html',
  styleUrls: ['./my-books-tab.css']
})
export class MyBooksTabComponent implements OnInit {
  @Input() user: any = null;

  allBorrows: any[] = [];
  filteredBorrows: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  
  activeFilter: string = 'all'; // all, borrowed, pending, returned, overdue
  searchTerm: string = '';

  // Return book modal
  showReturnModal: boolean = false;
  selectedBorrow: any = null;
  returning: boolean = false;
  returnSuccess: string = '';
  returnError: string = '';

  constructor(private borrowService: BorrowService) {}

  ngOnInit() {
    this.loadMyBooks();
  }

  loadMyBooks() {
    if (!this.user || !this.user.userId) {
      this.errorMessage = 'User not logged in';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.borrowService.getUserBorrows(this.user.userId).subscribe({
      next: (response) => {
        console.log('User borrows loaded:', response);
        this.allBorrows = response.sort((a: any, b: any) => {
          return new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime();
        });
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user borrows:', error);
        this.errorMessage = 'Failed to load your books. Please try again.';
        this.loading = false;
      }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allBorrows];

    // Apply status filter
    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(borrow => {
        if (this.activeFilter === 'borrowed') {
          return (borrow.status === 'BORROWED' || borrow.status === 'ACTIVE' || borrow.status === 'APPROVED') && !borrow.returnDate;
        } else if (this.activeFilter === 'pending') {
          return borrow.status === 'PENDING';
        } else if (this.activeFilter === 'returned') {
          return borrow.status === 'RETURNED' || borrow.returnDate;
        } else if (this.activeFilter === 'overdue') {
          return this.isOverdue(borrow);
        } else if (this.activeFilter === 'rejected') {
          return borrow.status === 'REJECTED';
        }
        return true;
      });
    }

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(borrow => 
        borrow.bookTitle?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        borrow.bookAuthor?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredBorrows = filtered;
  }

  isOverdue(borrow: any): boolean {
    if (borrow.status === 'RETURNED' || !borrow.dueDate) return false;
    const dueDate = new Date(borrow.dueDate);
    const today = new Date();
    return dueDate < today;
  }

  getDaysUntilDue(borrow: any): number {
    if (!borrow.dueDate) return 0;
    const dueDate = new Date(borrow.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusClass(borrow: any): string {
    if (borrow.status === 'RETURNED') return 'status-returned';
    if (borrow.status === 'PENDING') return 'status-pending';
    if (borrow.status === 'REJECTED') return 'status-rejected';
    if (this.isOverdue(borrow)) return 'status-overdue';
    if (borrow.status === 'ACTIVE' || borrow.status === 'APPROVED') return 'status-active';
    return '';
  }

  getStatusText(borrow: any): string {
    if (borrow.status === 'RETURNED') return 'Returned';
    if (borrow.status === 'PENDING') return 'Pending Approval';
    if (borrow.status === 'REJECTED') return 'Rejected';
    if (this.isOverdue(borrow)) return 'Overdue';
    if (borrow.status === 'BORROWED' || borrow.status === 'ACTIVE' || borrow.status === 'APPROVED') return 'Borrowed';
    return borrow.status;
  }

  canReturn(borrow: any): boolean {
    return (borrow.status === 'BORROWED' || borrow.status === 'ACTIVE' || borrow.status === 'APPROVED') && !borrow.returnDate;
  }

  openReturnModal(borrow: any) {
    this.selectedBorrow = borrow;
    this.showReturnModal = true;
    this.returnSuccess = '';
    this.returnError = '';
  }

  closeReturnModal() {
    this.showReturnModal = false;
    this.selectedBorrow = null;
    this.returnSuccess = '';
    this.returnError = '';
  }

  confirmReturn() {
    if (!this.selectedBorrow) return;

    this.returning = true;
    this.returnError = '';
    this.returnSuccess = '';

    console.log('Attempting to return book with ID:', this.selectedBorrow.id);
    console.log('Selected borrow object:', this.selectedBorrow);

    this.borrowService.returnBook(this.selectedBorrow.id).subscribe({
      next: (response) => {
        console.log('Book returned successfully:', response);
        this.returnSuccess = `Successfully returned "${this.selectedBorrow.bookTitle}"!`;
        this.returning = false;
        
        setTimeout(() => {
          this.closeReturnModal();
          this.loadMyBooks();
        }, 1500);
      },
      error: (error) => {
        console.error('Error returning book:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        this.returnError = error.error?.message || error.error?.error || error.message || 'Failed to return book. Please try again.';
        this.returning = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getActiveCount(): number {
    return this.allBorrows.filter(b => 
      (b.status === 'BORROWED' || b.status === 'ACTIVE' || b.status === 'APPROVED') && !b.returnDate
    ).length;
  }

  getPendingCount(): number {
    return this.allBorrows.filter(b => b.status === 'PENDING').length;
  }

  getReturnedCount(): number {
    return this.allBorrows.filter(b => b.status === 'RETURNED').length;
  }

  getOverdueCount(): number {
    return this.allBorrows.filter(b => this.isOverdue(b)).length;
  }
}
