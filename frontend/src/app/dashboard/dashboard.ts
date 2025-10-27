import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardOverviewComponent } from './dashboard-overview/dashboard-overview';
import { ProfileComponent } from './profile/profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardOverviewComponent, ProfileComponent],
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

  constructor(private router: Router) { }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    } else {
      this.router.navigate(['/login']);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
