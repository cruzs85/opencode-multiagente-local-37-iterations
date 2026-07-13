import { Component, signal } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameCanvasComponent } from './game-canvas/game-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, GameCanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  gameStarted = signal(false);
  onStartGame() { this.gameStarted.set(true); }
}