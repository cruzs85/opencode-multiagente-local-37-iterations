import { Component, inject, afterNextRender, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  private gameService = inject(GameService);
  private destroyRef = inject(DestroyRef);

  readonly gameState = this.gameService.gameState;
  readonly score = this.gameService.score;
  readonly highScore = this.gameService.highScore;
  readonly speed = this.gameService.speed;
  readonly dinoY = this.gameService.dinoY;
  readonly obstacles = this.gameService.obstacles;
  readonly isJumping = this.gameService.isJumping;
  readonly jumpCount = this.gameService.jumpCount;

  constructor() {
    afterNextRender(() => {
      const keyHandler = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          this.gameService.jump();
        }
      };

      const touchHandler = (e: TouchEvent) => {
        e.preventDefault();
        this.gameService.jump();
      };

      window.addEventListener('keydown', keyHandler);
      window.addEventListener('touchstart', touchHandler);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('keydown', keyHandler);
        window.removeEventListener('touchstart', touchHandler);
      });
    });
  }

  onGameAreaClick(): void {
    this.gameService.jump();
  }

  onRestart(): void {
    this.gameService.startGame();
  }

  onBackToWelcome(): void {
    this.gameService.resetGame();
  }
}