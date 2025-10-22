import { Routes } from '@angular/router';
import {RegisterComponent} from './register/register';
import { Landing } from './landing/landing';
import { Login } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { LibrarianDashboardComponent } from './librarian-dashboard/librarian-dashboard';

export const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  { path: 'login', component: Login},
  { path: 'dashboard', component: DashboardComponent},
  { path: 'librarian-dashboard', component: LibrarianDashboardComponent},
  {path: '', component: Landing}
];
