import { Component, inject } from '@angular/core';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-game-over-screen',
  standalone: true,
  imports: [],
  templateUrl: './game-over-screen.component.html',
  styleUrl: './game-over-screen.component.scss'
})
export class GameOverScreenComponent {
  private gameService = inject(GameService)

  readonly score = this.gameService.score
  readonly highScore = this.gameService.highScore

  // restartGame(): llama a gameService.startGame()
  restartGame(): void {
    this.gameService.startGame();
  }

  // goToWelcome(): llama a gameService.resetToWelcome()
  goToWelcome(): void {
    this.gameService.resetToWelcome();
  }
}
