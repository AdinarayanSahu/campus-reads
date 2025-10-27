import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OverviewTabComponent } from './overview-tab/overview-tab';
import { ManageBooksTabComponent } from './manage-books-tab/manage-books-tab';
import { ManageUsersTabComponent } from './manage-users-tab/manage-users-tab';
import { BorrowRequestsTabComponent } from './borrow-requests-tab/borrow-requests-tab';
import { BorrowService } from '../services/borrow.service';

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
    private borrowService: BorrowService
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
      this.loadPendingRequestsCount();
    } else {
      this.router.navigate(['/login']);
      return;
    }
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
      // Reload pending count when switching to requests tab
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
