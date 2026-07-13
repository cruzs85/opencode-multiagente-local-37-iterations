import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../game.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container" (click)="onGameClick()" (window:keydown)="onKeyDown($event)">
      <!-- HUD -->
      <div class="hud">
        <div class="score">
          <span class="score-label">SCORE:</span>
          <span class="score-value">{{ gameService.state().score }}</span>
        </div>
        <div class="high-score">
          <span class="score-label">HI-SCORE:</span>
          <span class="score-value">{{ gameService.highScore() }}</span>
        </div>
        @if (gameService.state().screen === 'playing') {
          <div class="speed">
            <span class="speed-label">SPEED:</span>
            <span class="speed-value">{{ gameService.state().speed.toFixed(1) }}</span>
          </div>
        }
      </div>

      <!-- Game area -->
      <div class="game-area">
        <!-- Dino -->
        <div 
          class="dino" 
          [style.bottom.px]="50 + gameService.state().dinoY"
          [style.left]="'100px'"
        >
          <span class="dino-body">🦖</span>
        </div>

        <!-- Obstacles -->
        @for (obstacle of gameService.state().obstacles; track obstacle.id) {
          <div 
            class="obstacle" 
            [class.bird]="obstacle.type === 'bird'"
            [style.left.px]="obstacle.x"
            [style.bottom.px]="obstacle.y"
            [style.width.px]="obstacle.width"
            [style.height.px]="obstacle.height"
          >
          </div>
        }

        <!-- Ground -->
        <div class="ground"></div>
      </div>

      <!-- Game Over Overlay -->
      @if (gameService.state().screen === 'gameover') {
        <div class="game-over-overlay">
          <div class="game-over-content">
            <h2>GAME OVER</h2>
            <p>Score: {{ gameService.state().score }}</p>
            <p>High Score: {{ gameService.highScore() }}</p>
            <button class="restart-btn" (click)="restartGame()">RESTART</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .game-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      background-color: #0a0a0f;
      overflow: hidden;
      font-family: 'Press Start 2P', monospace;
    }

    .hud {
      position: absolute;
      top: 20px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 10;
    }

    .score, .high-score, .speed {
      color: #00f0ff;
      text-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff;
      font-size: 14px;
      line-height: 1.4;
    }

    .score-label, .high-score-label, .speed-label {
      display: block;
      margin-bottom: 5px;
      font-size: 10px;
    }

    .score-value, .high-score-value, .speed-value {
      display: block;
      font-size: 18px;
      font-weight: bold;
    }

    .game-area {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .dino {
      position: absolute;
      left: 100px;
      width: 80px;
      height: 120px;
      font-size: 80px;
      z-index: 5;
    }

    .dino-body {
      display: block;
      animation: bounce 0.5s infinite alternate;
      transform: scaleX(-1);
    }

    .obstacle {
      position: absolute;
      bottom: 50px;
      width: 30px;
      height: 50px;
      background-color: #ff00aa;
      border: 2px solid #ff00ff;
      box-shadow: 0 0 7px #ff00aa, 0 0 10px #ff00aa, 0 0 21px #ff00aa;
      z-index: 4;
    }

    .obstacle.bird {
      width: 40px;
      height: 30px;
      border-radius: 50%;
    }

    .ground {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50px;
      background-color: #00f0ff;
      box-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff;
      z-index: 3;
    }

    .game-over-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(13, 13, 22, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20;
    }

    .game-over-content {
      text-align: center;
      color: #00f0ff;
      text-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff;
    }

    .game-over-content h2 {
      font-size: 30px;
      margin-bottom: 20px;
    }

    .game-over-content p {
      font-size: 16px;
      margin: 10px 0;
    }

    .restart-btn {
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #1e1e32;
      border: 1px solid #00f0ff;
      color: #00f0ff;
      font-family: 'Press Start 2P', monospace;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff;
      transition: all 0.3s ease;
    }

    .restart-btn:hover {
      background-color: #2a2a45;
      box-shadow: 0 0 15px #00f0ff, 0 0 20px #00f0ff, 0 0 30px #00f0ff;
    }

    @keyframes bounce {
      0% { margin-top: 0; }
      100% { margin-top: -5px; }
    }
  `
})
export class GameComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);

  ngOnInit(): void {
    this.gameService.startGame();
  }

  ngOnDestroy(): void {
    // No llamamos a stopLoop porque esto solo se ejecuta en tests
    // Para evitar errores de limpieza, aseguramos que el método exista
    if (this.gameService.stopLoop) {
      this.gameService.stopLoop();
    }
  }

  onGameClick(): void {
    this.gameService.jump();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }

  restartGame(): void {
    this.gameService.resetGame();
    this.gameService.startGame();
  }
}