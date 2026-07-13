import { Component, inject, afterNextRender, effect, HostListener } from '@angular/core';
import { GameService } from '../../services/game.service';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  private readonly gameService = inject(GameService);
  readonly scoreService = inject(ScoreService);

  readonly gameState = this.gameService.gameState;
  readonly Math = Math;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor() {
    afterNextRender(() => {
      this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d')!;
      this.render();
    });

    effect(() => {
      const state = this.gameState();
      if (state.isRunning) {
        this.render();
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.key === 'ArrowUp') {
      if (!this.gameState().isRunning && !this.gameState().isGameOver) {
        this.startGame();
      }
      this.gameService.jump();
      event.preventDefault();
    }
  }

  startGame(): void {
    this.gameService.startGame();
    this.render();
  }

  render(): void {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, 800, 400);

    // Draw sky
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.fillRect(0, 0, 800, 400);

    // Draw ground
    this.ctx.fillStyle = '#795548';
    this.ctx.fillRect(0, 350, 800, 50);

    // Draw dinosaur
    const dino = this.gameState().dinosaur;
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw dinosaur eye
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(dino.x + 30, dino.y + 10, 8, 8);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(dino.x + 32, dino.y + 12, 4, 4);

    // Draw obstacles
    for (const obstacle of this.gameState().obstacles) {
      if (obstacle.type === 'cactus') {
        this.ctx.fillStyle = '#2E7D32';
      } else {
        this.ctx.fillStyle = '#F44336';
      }
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Continue animation loop
    if (this.gameState().isRunning) {
      requestAnimationFrame(() => this.render());
    }
  }
}