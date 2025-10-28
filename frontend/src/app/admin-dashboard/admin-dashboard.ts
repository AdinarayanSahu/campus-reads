import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminOverviewTabComponent } from './admin-overview-tab/admin-overview-tab';
import { AdminManageBooksTabComponent } from './admin-manage-books-tab/admin-manage-books-tab';
import { AdminManageLibrariansTabComponent } from './admin-manage-librarians-tab/admin-manage-librarians-tab';
import { AdminManageUsersTabComponent } from './admin-manage-users-tab/admin-manage-users-tab';
import { BookService } from '../services/book.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    AdminOverviewTabComponent,
    AdminManageBooksTabComponent,
    AdminManageLibrariansTabComponent,
    AdminManageUsersTabComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  user: any = null;
  activeTab: string = 'overview';
  
  stats = {
    totalBooks: 0,
    totalUsers: 0,
    totalLibrarians: 0
  };

  constructor(
    private router: Router,
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
      if (!this.user.role || this.user.role.toUpperCase() !== 'ADMIN') {
        this.router.navigate(['/dashboard']);
        return;
      }
      this.loadStats();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadStats() {
    this.bookService.getAllBooks().subscribe({
      next: (books) => {
        this.stats.totalBooks = books.length;
      },
      error: (error) => console.error('Error loading books:', error)
    });

    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.stats.totalUsers = users.filter((u: any) => 
          u.role && u.role.toUpperCase() === 'USER'
        ).length;
        this.stats.totalLibrarians = users.filter((u: any) => 
          u.role && u.role.toUpperCase() === 'LIBRARIAN'
        ).length;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  onBookCountUpdated(count: number) {
    this.stats.totalBooks = count;
  }

  onLibrarianCountUpdated(count: number) {
    this.stats.totalLibrarians = count;
  }

  onUserCountUpdated(count: number) {
    this.stats.totalUsers = count;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}
