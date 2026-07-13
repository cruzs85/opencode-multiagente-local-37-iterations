import { Component, inject } from '@angular/core';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  templateUrl: './welcome-screen.component.html',
  styleUrl: './welcome-screen.component.scss',
})
export class WelcomeScreenComponent {
  private gameService = inject(GameService);
  readonly highScore = this.gameService.highScore;

  startGame(): void {
    this.gameService.startGame();
  }
}