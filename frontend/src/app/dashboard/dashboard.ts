import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview';
import { ProfileComponent } from './profile/profile';
import { BrowseBooksTabComponent } from './browse-books-tab/browse-books-tab';
import { MyBooksTabComponent } from './my-books-tab/my-books-tab';
import { BorrowService } from '../services/borrow.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardOverviewComponent, ProfileComponent, BrowseBooksTabComponent, MyBooksTabComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  activeTab: string = 'overview';

  stats = {
    booksBorrowed: 0,
    booksReturned: 0,
    pendingReturns: 0
  };

  constructor(
    private router: Router,
    private borrowService: BorrowService
  ) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.loadUserStats();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserStats() {
    if (!this.user || !this.user.userId) return;

    // Get all user's borrow records
    this.borrowService.getUserBorrows(this.user.userId).subscribe({
      next: (borrows) => {
        // Calculate stats from borrow records
        this.stats.booksBorrowed = borrows.length;
        this.stats.booksReturned = borrows.filter((b: any) => 
          b.status === 'RETURNED' || b.returnDate
        ).length;
        this.stats.pendingReturns = borrows.filter((b: any) => 
          b.status === 'ACTIVE' || (b.status === 'APPROVED' && !b.returnDate)
        ).length;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Refresh stats when switching to overview tab
    if (tab === 'overview') {
      this.loadUserStats();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
