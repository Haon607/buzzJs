import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor() {}
}
