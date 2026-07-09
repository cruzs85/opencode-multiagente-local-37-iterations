import { Component, inject, DestroyRef } from '@angular/core';
import { Welcome } from './welcome/welcome';
import { Game } from './game/game';
import { GameOver } from './game-over/game-over';
import { GameEngineService } from './services/game-engine.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  imports: [Welcome, Game, GameOver]
})
export class App {
  gameEngine = inject(GameEngineService);
  destroyRef = inject(DestroyRef);
  gameState = this.gameEngine.gameState;

  handleGameOver() {
    // El gameEngine ya pone gameState a 'gameOver' internamente
  }

  handleRetry() {
    this.gameEngine.startGame();
  }

  handleMenu() {
    this.gameEngine.resetGame();
  }

  constructor() {
    console.log('[DIAG] AppComponent loaded');
    window.onerror = (msg, url, line) => {
      console.error('[DIAG] ERROR:', msg, url, line);
    };
    
    this.destroyRef.onDestroy(() => {
      window.onerror = null;
    });
  }
}