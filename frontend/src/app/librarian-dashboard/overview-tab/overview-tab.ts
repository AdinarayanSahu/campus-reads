import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview-tab.html',
  styleUrls: ['./overview-tab.css']
})
export class OverviewTabComponent {
  @Input() stats: any = {
    totalBooks: 0,
    issuedBooks: 0,
    totalUsers: 0,
    pendingRequests: 0
  };
}
