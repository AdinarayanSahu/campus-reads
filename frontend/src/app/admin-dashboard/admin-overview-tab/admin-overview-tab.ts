import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-overview-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview-tab.html',
  styleUrls: ['./admin-overview-tab.css']
})
export class AdminOverviewTabComponent {
  @Input() stats: any = {
    totalBooks: 0,
    totalUsers: 0,
    totalLibrarians: 0
  };
}
