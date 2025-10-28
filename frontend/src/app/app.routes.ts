import { Routes } from '@angular/router';
import {RegisterComponent} from './register/register';
import { Landing } from './landing/landing';
import { Login } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { LibrarianDashboardComponent } from './librarian-dashboard/librarian-dashboard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['USER', 'STUDENT'] }
  },
  { 
    path: 'librarian-dashboard', 
    component: LibrarianDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LIBRARIAN'] }
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  }
];
