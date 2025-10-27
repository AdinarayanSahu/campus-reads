import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OverviewTabComponent } from './overview-tab/overview-tab';
import { ManageBooksTabComponent } from './manage-books-tab/manage-books-tab';
import { ManageUsersTabComponent } from './manage-users-tab/manage-users-tab';

@Component({
  selector: 'app-librarian-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    OverviewTabComponent,
    ManageBooksTabComponent,
    ManageUsersTabComponent
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

  constructor(private router: Router) {}

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
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
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
