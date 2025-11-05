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
      
      if (this.user.role) {
        const role = this.user.role.toUpperCase();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
          return;
        } else if (role === 'LIBRARIAN') {
          this.router.navigate(['/librarian-dashboard']);
          return;
        }
      }
      
      this.loadUserStats();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserStats() {
    if (!this.user || !this.user.userId) return;

    this.borrowService.getUserBorrows(this.user.userId).subscribe({
      next: (borrows) => {
        this.stats.booksBorrowed = borrows.filter((b: any) => b.status === 'BORROWED' && !b.returnDate).length;
        this.stats.booksReturned = borrows.filter((b: any) => 
          b.status === 'RETURNED' || !!b.returnDate
        ).length;
        this.stats.pendingReturns = borrows.filter((b: any) => b.status === 'BORROWED' && !b.returnDate).length;
      },
      error: (error) => {
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'overview') {
      this.loadUserStats();
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
