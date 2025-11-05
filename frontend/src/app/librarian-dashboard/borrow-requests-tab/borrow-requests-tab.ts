import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BorrowService } from '../../services/borrow.service';

@Component({
    selector: 'app-borrow-requests-tab',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './borrow-requests-tab.html',
    styleUrls: ['./borrow-requests-tab.css']
})
export class BorrowRequestsTabComponent implements OnInit {
    
    allBorrows: any[] = [];
    filteredBorrows: any[] = [];
    loading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    
    filterStatus: string = 'all';
    searchTerm: string = '';
    
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 1;
    paginatedBorrows: any[] = [];

    selectedBorrow: any = null;
    showDetailsModal: boolean = false;

    processingAction: boolean = false;
    showRejectModal: boolean = false;
    rejectReason: string = '';
    borrowToReject: any = null;

    showReturnModal: boolean = false;
    borrowToReturn: any = null;

    constructor(private borrowService: BorrowService) { }

    ngOnInit() {
        this.loadBorrowRecords();
    }

    loadBorrowRecords() {
        this.loading = true;
        this.errorMessage = '';
        
        this.borrowService.getAllBorrows().subscribe({
            next: (response) => {
                
                this.allBorrows = response.map((borrow: any) => ({
                    ...borrow,
                    isOverdue: this.checkIfOverdue(borrow)
                }));
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                
                this.errorMessage = 'Failed to load borrow records. Please try again.';
                this.loading = false;
            }
        });
    }

    checkIfOverdue(borrow: any): boolean {
        if (borrow.status === 'RETURNED') return false;
        const dueDate = new Date(borrow.dueDate);
        const today = new Date();
        return today > dueDate;
    }

    applyFilters() {
        this.filteredBorrows = this.allBorrows.filter(borrow => {

            const matchesStatus = this.filterStatus === 'all' || 
                                  (this.filterStatus === 'pending' && borrow.status === 'PENDING') ||
                                  (this.filterStatus === 'active' && borrow.status === 'BORROWED' && !borrow.isOverdue) ||
                                  (this.filterStatus === 'overdue' && borrow.isOverdue) ||
                                  (this.filterStatus === 'returned' && borrow.status === 'RETURNED') ||
                                  (this.filterStatus === 'rejected' && borrow.status === 'REJECTED');

            const matchesSearch = !this.searchTerm ||
                                  borrow.bookTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                  borrow.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                                  borrow.userEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

            return matchesStatus && matchesSearch;
        });

        this.currentPage = 1;
        this.updatePagination();
    }

    onFilterChange() {
        this.applyFilters();
    }

    onSearch() {
        this.applyFilters();
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredBorrows.length / this.itemsPerPage);
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedBorrows = this.filteredBorrows.slice(startIndex, endIndex);
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePagination();
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

    viewDetails(borrow: any) {
        this.selectedBorrow = borrow;
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.selectedBorrow = null;
    }

    getStatusClass(borrow: any): string {
        if (borrow.status === 'RETURNED') return 'status-returned';
        if (borrow.status === 'PENDING') return 'status-pending';
        if (borrow.status === 'REJECTED') return 'status-rejected';
        if (borrow.isOverdue) return 'status-overdue';
        return 'status-active';
    }

    getStatusText(borrow: any): string {
        if (borrow.status === 'RETURNED') return 'Returned';
        if (borrow.status === 'PENDING') return 'Pending Approval';
        if (borrow.status === 'REJECTED') return 'Rejected';
        if (borrow.isOverdue) return 'Overdue';
        return 'Active';
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    calculateDaysRemaining(dueDate: string): number {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    getActiveBorrowsCount(): number {
        return this.allBorrows.filter(b => b.status === 'BORROWED' && !b.isOverdue).length;
    }

    getPendingRequestsCount(): number {
        return this.allBorrows.filter(b => b.status === 'PENDING').length;
    }

    getOverdueBorrowsCount(): number {
        return this.allBorrows.filter(b => b.isOverdue).length;
    }

    getReturnedBorrowsCount(): number {
        return this.allBorrows.filter(b => b.status === 'RETURNED').length;
    }

    refreshData() {
        this.successMessage = '';
        this.errorMessage = '';
        this.loadBorrowRecords();
    }

    approveBorrowRequest(borrow: any) {
        if (confirm(`Approve borrow record for "${borrow.bookTitle}" by ${borrow.userName}?`)) {
            this.processingAction = true;
            this.errorMessage = '';
            this.successMessage = '';

            this.borrowService.approveBorrowRequest(borrow.id).subscribe({
                next: (response) => {
                    
                    this.successMessage = `Successfully approved borrow record for "${borrow.bookTitle}"`;
                    this.processingAction = false;
                    this.loadBorrowRecords();
                },
                error: (error) => {
                    
                    this.errorMessage = error.error?.error || 'Failed to approve request. Please try again.';
                    this.processingAction = false;
                }
            });
        }
    }

    openRejectModal(borrow: any) {
        this.borrowToReject = borrow;
        this.rejectReason = '';
        this.showRejectModal = true;
    }

    closeRejectModal() {
        this.showRejectModal = false;
        this.borrowToReject = null;
        this.rejectReason = '';
    }

    rejectBorrowRequest() {
        if (!this.borrowToReject) return;

        this.processingAction = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.borrowService.rejectBorrowRequest(this.borrowToReject.id, this.rejectReason).subscribe({
            next: (response) => {
                
                this.successMessage = `Successfully rejected borrow record for "${this.borrowToReject.bookTitle}"`;
                this.processingAction = false;
                this.closeRejectModal();
                this.loadBorrowRecords();
            },
            error: (error) => {
                
                this.errorMessage = error.error?.error || 'Failed to reject request. Please try again.';
                this.processingAction = false;
            }
        });
    }
    
    openReturnModal(borrow: any) {
        this.borrowToReturn = borrow;
        this.showReturnModal = true;
    }

    closeReturnModal() {
        this.showReturnModal = false;
        this.borrowToReturn = null;
    }

    confirmReturnBook() {
        if (!this.borrowToReturn) return;

        this.processingAction = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.borrowService.returnBook(this.borrowToReturn.id).subscribe({
            next: (response) => {
                console.log('Book returned successfully:', response);
                this.successMessage = `Successfully marked "${this.borrowToReturn.bookTitle}" as returned`;
                this.processingAction = false;
                this.closeReturnModal();
                this.loadBorrowRecords();
            },
            error: (error) => {
                console.error('Error returning book:', error);
                this.errorMessage = error.error?.error || 'Failed to mark book as returned. Please try again.';
                this.processingAction = false;
            }
        });
    }
}
