import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  template: `
    <div class="game-over-overlay">
      <div class="game-over-content">
        <h1 class="game-over-title">GAME OVER</h1>
        <div class="score-container">
          <p class="final-score">Puntuación: {{ state().score }}</p>
          <p class="high-score">Récord: {{ highScore() }}</p>
          @if (state().score >= highScore()) {
            <p class="new-record">¡Nuevo Récord!</p>
          }
        </div>
        <div class="button-container">
          <button class="retry-button" (click)="retryGame()">Reintentar</button>
          <button class="menu-button" (click)="goToMenu()">Menú Principal</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .game-over-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(10, 10, 15, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.5s ease-out;
    }

    .game-over-content {
      text-align: center;
      padding: 2rem;
      background: rgba(20, 20, 30, 0.9);
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.3);
      border: 1px solid rgba(0, 240, 255, 0.2);
      animation: slideUp 0.5s ease-out;
    }

    .game-over-title {
      color: #ff00ff;
      font-size: 3rem;
      margin: 0 0 1rem 0;
      text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
      animation: pulse 1.5s infinite;
    }

    .final-score {
      color: #00f0ff;
      font-size: 2rem;
      margin: 1rem 0;
      text-shadow: 0 0 5px #00f0ff;
    }

    .high-score {
      color: #00f0ff;
      font-size: 1.5rem;
      margin: 0.5rem 0;
    }

    .new-record {
      color: #00f0ff;
      font-size: 1.2rem;
      font-weight: bold;
      margin: 1rem 0;
      text-shadow: 0 0 5px #00f0ff;
    }

    .button-container {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .retry-button, .menu-button {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .retry-button {
      background: rgba(0, 240, 255, 0.1);
      color: #00f0ff;
      border: 1px solid #00f0ff;
    }

    .menu-button {
      background: rgba(255, 0, 255, 0.1);
      color: #ff00ff;
      border: 1px solid #ff00ff;
    }

    .retry-button:hover, .menu-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0, 240, 255, 0.4);
    }

    .retry-button:hover {
      box-shadow: 0 5px 15px rgba(0, 240, 255, 0.4);
    }

    .menu-button:hover {
      box-shadow: 0 5px 15px rgba(255, 0, 255, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes pulse {
      0% { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff; }
      50% { text-shadow: 0 0 15px #ff00ff, 0 0 30px #ff00ff; }
      100% { text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff; }
    }
  `
})
export class GameOverComponent {
  private gameService = inject(GameService);
  
  protected readonly state = this.gameService.state;
  protected readonly highScore = this.gameService.highScore;
  
  retryGame(): void {
    this.gameService.resetGame();
    this.gameService.startGame();
  }
  
  goToMenu(): void {
    this.gameService.resetGame();
  }
}