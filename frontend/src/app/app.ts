import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Landing } from "./landing/landing";
import { RegisterComponent } from "./register/register";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Landing, RegisterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
