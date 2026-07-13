import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreService } from '../services/score.service';
import { ScreenStateService } from '../services/screen-state.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class GameComponent {
  private readonly gameService = inject(GameService);
  public readonly scoreService = inject(ScoreService);
  private readonly screenState = inject(ScreenStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('gameCanvas');

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private lastTime = 0;
  private isRunning = false;
  private readonly resizeHandler = () => this.resizeCanvas();

  constructor() {
    console.log('[DIAG] GameComponent loaded');
    afterNextRender(() => {
      this.initCanvas();
      this.startGameLoop();
    });
  }

  private initCanvas(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeHandler);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', this.resizeHandler);
    });
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private startGameLoop(): void {
    this.gameService.startGame();
    this.scoreService.resetScore();
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));

    const jumpHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.gameService.jump();
      }
    };
    window.addEventListener('keydown', jumpHandler);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', jumpHandler);
    });
  }

  private gameLoop(time: number): void {
    if (!this.isRunning) return;

    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const canvas = this.canvasRef().nativeElement;

    this.gameService.update(deltaTime, canvas.width, canvas.height);
    this.scoreService.addScore(Math.floor(this.gameService.speed() * deltaTime / 10));

    if (this.gameService.checkCollision()) {
      this.gameService.stopGame();
      this.scoreService.saveHighScore();
      this.isRunning = false;
      cancelAnimationFrame(this.animationId);
      this.screenState.gameOver();
      return;
    }

    this.render(canvas);
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  private render(canvas: HTMLCanvasElement): void {
    const ctx = this.ctx;
    const dino = this.gameService.dino();
    const obstacles = this.gameService.obstacles();
    const groundY = this.gameService.groundY();

    // Clear
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = '#606070';
    ctx.fillRect(0, groundY, canvas.width, 2);

    // Dino
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    ctx.shadowBlur = 0;

    // Obstacles
    for (const obs of obstacles) {
      ctx.fillStyle = '#ff00aa';
      ctx.shadowColor = '#ff00aa';
      ctx.shadowBlur = 8;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.shadowBlur = 0;
    }

    // Score
    ctx.fillStyle = '#f0f0f0';
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${Math.floor(this.scoreService.currentScore())}`, 20, 40);

    // High score
    ctx.textAlign = 'right';
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '14px "Inter"';
    ctx.fillText(`HIGH: ${this.scoreService.highScore()}`, canvas.width - 20, 30);
  }
}