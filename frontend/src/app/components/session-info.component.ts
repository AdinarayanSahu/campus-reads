import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-session-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="session-info">
      <div class="user-info" *ngIf="userData">
        <span class="user-name">{{ userData.name }}</span>
        <span class="user-role">({{ userData.role }})</span>
      </div>
      <div class="session-status">
        <span class="time-remaining" *ngIf="timeRemaining > 0">
          Session expires in: {{ formatTime(timeRemaining) }}
        </span>
        <button class="btn-logout" (click)="onLogout()">Logout</button>
      </div>
    </div>
  `,
  styles: [`
    .session-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-name {
      font-weight: 600;
      color: #333;
    }

    .user-role {
      color: #666;
      font-size: 0.9em;
    }

    .session-status {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .time-remaining {
      font-size: 0.85em;
      color: #666;
    }

    .btn-logout {
      padding: 8px 16px;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      transition: background-color 0.3s;
    }

    .btn-logout:hover {
      background-color: #c82333;
    }

    .btn-logout:active {
      transform: scale(0.98);
    }
  `]
})
export class SessionInfoComponent implements OnInit, OnDestroy {
  userData: any = null;
  timeRemaining: number = 0;
  private timerSubscription?: Subscription;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userData = this.sessionService.getUserData();
    this.updateTimeRemaining();
    
    this.timerSubscription = interval(30000).subscribe(() => {
      this.updateTimeRemaining();
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  updateTimeRemaining(): void {
    this.timeRemaining = this.sessionService.getSessionTimeRemaining();
  }

  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.sessionService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
}
