import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OverviewTabComponent } from './overview-tab/overview-tab';
import { ManageBooksTabComponent } from './manage-books-tab/manage-books-tab';
import { ManageUsersTabComponent } from './manage-users-tab/manage-users-tab';
import { BorrowRequestsTabComponent } from './borrow-requests-tab/borrow-requests-tab';
import { BorrowService } from '../services/borrow.service';
import { BookService } from '../services/book.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-librarian-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    OverviewTabComponent,
    ManageBooksTabComponent,
    ManageUsersTabComponent,
    BorrowRequestsTabComponent
  ],
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

  constructor(
    private router: Router,
    private borrowService: BorrowService,
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
      this.loadStats();
    } else {
      this.router.navigate(['/login']);
      return;
    }
  }

  loadStats() {
    this.loadBooksCount();
    this.loadUsersCount();
    this.loadIssuedBooksCount();
    this.loadPendingRequestsCount();
  }

  loadBooksCount() {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.stats.totalBooks = books.length;
      },
      error: (error) => {
        console.error('Error loading books count:', error);
      }
    });
  }

  loadUsersCount() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.filter((u: any) => 
          u.role && u.role.toUpperCase() === 'USER'
        ).length;
      },
      error: (error) => {
        console.error('Error loading users count:', error);
      }
    });
  }

  loadIssuedBooksCount() {
    this.borrowService.getAllBorrows().subscribe({
      next: (records: any) => {
        this.stats.issuedBooks = records.filter((r: any) => 
          r.status && r.status.toUpperCase() === 'BORROWED'
        ).length;
      },
      error: (error: any) => {
        console.error('Error loading issued books count:', error);
      }
    });
  }

  loadPendingRequestsCount() {
    this.borrowService.getPendingRequests().subscribe({
      next: (requests) => {
        this.stats.pendingRequests = requests.length;
      },
      error: (error) => {
        console.error('Error loading pending requests count:', error);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'requests') {
      this.loadPendingRequestsCount();
    }
  }

  onBookCountUpdated(count: number) {
    this.stats.totalBooks = count;
  }

  onUserCountUpdated(count: number) {
    this.stats.totalUsers = count;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}
