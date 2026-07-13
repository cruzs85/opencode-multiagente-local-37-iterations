import { Component, signal } from '@angular/core';
import { GameComponent } from './game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = signal('Dino Runner');
}
