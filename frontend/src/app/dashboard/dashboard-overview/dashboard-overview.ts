import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-overview.html',
  styleUrls: ['./dashboard-overview.css']
})
export class DashboardOverviewComponent {
  @Input() user: any = null;
  @Input() stats: any = {
    booksBorrowed: 0,
    booksReturned: 0,
    pendingReturns: 0
  };
}
