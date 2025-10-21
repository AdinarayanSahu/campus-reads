import { Routes } from '@angular/router';
import {RegisterComponent} from './register/register';
import { Landing } from './landing/landing';
import { Login } from './login/login';

export const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  { path: 'login', component: Login},
  {path: '', component: Landing}
];
