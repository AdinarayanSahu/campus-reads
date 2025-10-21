import { Routes } from '@angular/router';
import {RegisterComponent} from './register/register';
import { Landing } from './landing/landing';
import { Login } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';

export const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  { path: 'login', component: Login},
  { path: 'dashboard', component: DashboardComponent},
  {path: '', component: Landing}
];
