import { Component, inject, output, DestroyRef, signal, computed } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [],
  templateUrl: './game-over.html',
  styleUrl: './game-over.scss'
})
export class GameOver {
  private gameEngine = inject(GameEngineService);
  gameState = this.gameEngine.gameState;

  finalScore = this.gameEngine.score;
  highScore = this.gameEngine.highScore;
  isNewRecord = computed(() => this.finalScore() > this.highScore() && this.gameEngine.gameState() === 'gameOver');

  retry = output<void>();
  menu = output<void>();

  retryGame() {
    this.gameEngine.startGame();
    this.retry.emit();
  }

  goToMenu() {
    this.gameEngine.resetGame();
    this.menu.emit();
  }
}