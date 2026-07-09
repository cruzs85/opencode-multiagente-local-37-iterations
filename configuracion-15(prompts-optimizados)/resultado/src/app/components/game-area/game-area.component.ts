import { Component, inject, DestroyRef, afterNextRender, Injector, effect } from '@angular/core';
import { GameService } from '../../services/game.service';
import { GAME_CONSTANTS, DinoState, Obstacle } from '../../models/game.models';

@Component({
  selector: 'app-game-area',
  standalone: true,
  templateUrl: './game-area.component.html',
  styleUrl: './game-area.component.scss',
})
export class GameAreaComponent {
  private gameService = inject(GameService);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime = 0;

  // Signals re-expuestos para el template
  readonly score = this.gameService.score;
  readonly highScore = this.gameService.highScore;
  readonly speed = this.gameService.speed;
  readonly gameOver = this.gameService.gameOver;
  readonly phase = this.gameService.phase;

  constructor() {
    afterNextRender(() => {
      this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d')!;
      this.canvas.width = GAME_CONSTANTS.CANVAS_WIDTH;
      this.canvas.height = GAME_CONSTANTS.CANVAS_HEIGHT;
      this.setupInput();
      this.startLoop();
    });
  }

  restartGame(): void {
    this.gameService.startGame();
  }

  goToWelcome(): void {
    this.gameService.resetGame();
  }

  private startLoop(): void {
    const loop = (timestamp: number) => {
      if (this.lastTime === 0) {
        this.lastTime = timestamp;
      }
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      if (deltaTime < 100) {
        this.gameService.update(deltaTime);
      }

      this.render();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (this.gameService.gameOver()) {
          this.restartGame();
        } else {
          this.gameService.jump();
        }
      }
      if (e.code === 'Enter') {
        if (this.gameService.gameOver()) {
          this.restartGame();
        } else if (this.gameService.phase() === 'welcome') {
          this.gameService.startGame();
        }
      }
      if (e.code === 'Escape') {
        this.goToWelcome();
      }
    };

    const handleClick = () => {
      if (this.gameService.gameOver()) {
        this.restartGame();
      } else {
        this.gameService.jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (this.canvas) {
      this.canvas.addEventListener('click', handleClick);
    }

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handleKeyDown);
      if (this.canvas) {
        this.canvas.removeEventListener('click', handleClick);
      }
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
  }

  private render(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const W = GAME_CONSTANTS.CANVAS_WIDTH;
    const H = GAME_CONSTANTS.CANVAS_HEIGHT;

    // Fondo
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, W, H);

    // Suelo
    this.renderGround(ctx);

    // Obstáculos
    for (const obs of this.gameService.obstacles()) {
      this.renderObstacle(ctx, obs);
    }

    // Dinosaurio
    this.renderDino(ctx, this.gameService.dino());

    // Nubes decorativas
    this.renderClouds(ctx);

    // Score en canvas
    this.renderScore(ctx);

    // Game over overlay
    if (this.gameService.gameOver()) {
      this.renderGameOver(ctx);
    }
  }

  private renderGround(ctx: CanvasRenderingContext2D): void {
    const groundY = GAME_CONSTANTS.GROUND_Y;
    const offset = this.gameService.groundOffset();
    const W = GAME_CONSTANTS.CANVAS_WIDTH;

    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    ctx.fillStyle = '#535353';
    for (let x = -offset; x < W; x += 20) {
      ctx.fillRect(x, groundY + 4, 8, 2);
    }
  }

  private renderDino(ctx: CanvasRenderingContext2D, dino: DinoState): void {
    ctx.save();

    // Cuerpo principal
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height - 6);

    // Cabeza (parte superior que sobresale)
    ctx.fillRect(dino.x + 18, dino.y - 6, 22, 10);

    // Ojo
    ctx.fillStyle = 'white';
    ctx.fillRect(dino.x + 32, dino.y - 4, 6, 6);
    ctx.fillStyle = '#333';
    ctx.fillRect(dino.x + 34, dino.y - 2, 3, 3);

    // Boca
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x + 38, dino.y + 4, 4, 2);

    // Brazos/patas delanteras
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x + 8, dino.y + 20, 6, 14);

    // Piernas con animación
    const legOffset = dino.isJumping ? 0 : (dino.legFrame === 1 ? 3 : -3);
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x + 6, dino.y + dino.height - 6, 8, 6);
    ctx.fillRect(dino.x + 24, dino.y + dino.height - 6, 8, 6);

    // Pies
    ctx.fillRect(dino.x + 4 + legOffset, dino.y + dino.height - 2, 12, 4);
    ctx.fillRect(dino.x + 22 - legOffset, dino.y + dino.height - 2, 12, 4);

    ctx.restore();
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
    ctx.save();

    if (obs.type === 'bird') {
      // Ave
      ctx.fillStyle = '#535353';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillRect(obs.x - 5, obs.y - 4, 40, 6);
      ctx.fillRect(obs.x - 5, obs.y + 18, 40, 6);
    } else {
      // Cactus
      ctx.fillStyle = '#2d8a4e';
      ctx.fillRect(obs.x + 4, obs.y, obs.width - 8, obs.height);
      const branchY = obs.y + 12;
      ctx.fillRect(obs.x, branchY, 8, 6);
      ctx.fillRect(obs.x + obs.width - 8, branchY + 8, 8, 6);
      ctx.fillStyle = '#3cb371';
      ctx.fillRect(obs.x + 6, obs.y + 4, 4, 4);
      ctx.fillRect(obs.x + obs.width - 10, obs.y + 10, 4, 4);
      ctx.fillRect(obs.x + 8, obs.y + 28, 4, 4);
    }

    ctx.restore();
  }

  private renderScore(ctx: CanvasRenderingContext2D): void {
    const score = this.gameService.score();
    const highScore = this.gameService.highScore();
    const speed = this.gameService.speed();

    ctx.save();
    ctx.font = 'bold 18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#535353';
    ctx.textAlign = 'right';

    ctx.fillText(`Puntos: ${Math.floor(score)}`, GAME_CONSTANTS.CANVAS_WIDTH - 20, 30);

    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText(`Récord: ${highScore}`, GAME_CONSTANTS.CANVAS_WIDTH - 20, 50);

    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`Velocidad: ${speed.toFixed(1)}`, GAME_CONSTANTS.CANVAS_WIDTH - 20, 68);

    ctx.restore();
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    const W = GAME_CONSTANTS.CANVAS_WIDTH;
    const H = GAME_CONSTANTS.CANVAS_HEIGHT;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = 'bold 48px "Segoe UI", sans-serif';
    ctx.fillStyle = '#535353';
    ctx.textAlign = 'center';
    ctx.fillText('¡Juego terminado!', W / 2, H / 2 - 40);

    const score = this.gameService.score();
    ctx.font = '24px "Segoe UI", sans-serif';
    ctx.fillStyle = '#667eea';
    ctx.fillText(`Puntos: ${Math.floor(score)}`, W / 2, H / 2 + 20);

    const highScore = this.gameService.highScore();
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillStyle = '#e67e22';
    ctx.fillText(`Récord: ${highScore}`, W / 2, H / 2 + 55);

    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('Presiona Espacio o Enter para reiniciar', W / 2, H / 2 + 100);
    ctx.fillText('Presiona Escape para volver al inicio', W / 2, H / 2 + 125);

    ctx.restore();
  }

  private renderClouds(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';

    const cloudPositions = [
      { x: 150, y: 40, w: 60, h: 20 },
      { x: 400, y: 60, w: 50, h: 18 },
      { x: 650, y: 30, w: 70, h: 22 },
    ];

    for (const cloud of cloudPositions) {
      const offsetX = (this.gameService.groundOffset() * 0.1) % 100;
      ctx.fillRect(
        ((cloud.x - offsetX + 800) % 800) - cloud.w / 2,
        cloud.y,
        cloud.w,
        cloud.h
      );
    }

    ctx.restore();
  }
}