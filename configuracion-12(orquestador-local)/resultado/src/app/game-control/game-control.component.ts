import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-control',
  standalone: true,
  template: `
    <div class="game-control">
      @if (!gameService.gameStarted()) {
        <button (click)="startGame()" class="start-button">
          {{ gameService.gameOver() ? 'Reiniciar Juego' : 'Iniciar Juego' }}
        </button>
      }
      <div class="game-info">
        <span>Puntuación: {{ gameService.score() }}</span>
        <span>Puntuación Máxima: {{ gameService.highScore() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .game-control {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
    }

    .start-button {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .start-button:hover {
      background-color: #45a049;
    }

    .game-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
  `]
})
export class GameControlComponent {
  readonly gameService = inject(GameService);

  startGame(): void {
    this.gameService.startGame();
  }
}