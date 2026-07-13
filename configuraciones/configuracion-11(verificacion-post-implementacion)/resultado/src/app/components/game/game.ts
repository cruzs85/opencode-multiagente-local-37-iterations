import { Component, inject, DestroyRef, afterNextRender } from '@angular/core';
import { GameEngineService } from '../../services/game-engine.service';
import { GameStatus } from '../../models/game.models';
import { ScoreBoard } from '../score-board/score-board';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [ScoreBoard],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game {
  private gameEngine = inject(GameEngineService);
  private destroyRef = inject(DestroyRef);

  readonly gameState = this.gameEngine.gameState;
  readonly isRunning = this.gameEngine.isRunning;
  readonly GameStatus = GameStatus;

  constructor() {
    afterNextRender(() => {
      this.setupCanvas();
      this.setupControls();
    });
  }

  private setupCanvas(): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 350;
      this.gameEngine.setCanvas(canvas);
    }
  }

  private setupControls(): void {
    const jumpHandler = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.handleJump();
        }
      } else {
        this.handleJump();
      }
    };

    window.addEventListener('keydown', jumpHandler);
    window.addEventListener('click', jumpHandler);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', jumpHandler);
      window.removeEventListener('click', jumpHandler);
      this.gameEngine.destroy();
    });
  }

  private handleJump(): void {
    if (this.gameState().status === GameStatus.GameOver) {
      this.gameEngine.resetGame();
      this.gameEngine.startGame();
    } else if (this.gameState().status === GameStatus.Playing) {
      this.gameEngine.jump();
    }
  }

  restart(): void {
    this.gameEngine.resetGame();
    this.gameEngine.startGame();
  }
}
