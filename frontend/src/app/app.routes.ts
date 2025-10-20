import { Routes } from '@angular/router';
import {RegisterComponent} from './register/register';
import { Landing } from './landing/landing';

export const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: '', component: Landing}
];
