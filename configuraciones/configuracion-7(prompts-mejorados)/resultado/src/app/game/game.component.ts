import { Component, ElementRef, inject, viewChild, afterNextRender, DestroyRef, HostListener, Injector } from '@angular/core';
import { GameService } from './services/game.service';
import { Cactus, CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y } from './models/game.types';
import { effect } from '@angular/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class GameComponent {
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('gameCanvas');

  readonly gameState = this.gameService.gameState;
  readonly isRunning = this.gameService.isRunning;
  readonly isGameOver = this.gameService.isGameOver;
  readonly score = this.gameService.score;
  readonly highScore = this.gameService.highScore;
  readonly dino = this.gameService.dino;
  readonly cactuses = this.gameService.cactuses;
  readonly speed = this.gameService.speed;

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvasRef()?.nativeElement;
      if (canvas) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
      }
    });

    effect(() => {
      this.render();
    }, { injector: this.injector });
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }

  render() {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const state = this.gameState();

    if (!state.isStarted) {
      this.drawStartScreen(ctx);
      this.drawGround(ctx);
      return;
    }

    this.drawGround(ctx);
    this.drawDino(ctx);
    this.cactuses().forEach(cactus => this.drawCactus(ctx, cactus));
    this.drawScore(ctx);

    if (state.isGameOver) {
      this.drawGameOver(ctx);
    }
  }

  drawDino(ctx: CanvasRenderingContext2D) {
    const dino = this.dino();
    ctx.fillStyle = '#535353';

    // Cuerpo principal
    ctx.fillRect(dino.x + 5, dino.y + 10, dino.width - 10, dino.height - 10);

    // Cabeza
    ctx.fillRect(dino.x + 15, dino.y, dino.width - 20, 15);

    // Ojo
    ctx.fillStyle = 'white';
    ctx.fillRect(dino.x + 25, dino.y + 3, 4, 5);
    ctx.fillStyle = '#535353';

    if (!dino.isJumping) {
      // Patas
      ctx.fillRect(dino.x + 8, dino.y + dino.height - 8, 8, 8);
      ctx.fillRect(dino.x + dino.width - 16, dino.y + dino.height - 8, 8, 8);
    }

    // Cola
    ctx.fillRect(dino.x, dino.y + 20, 8, 6);
  }

  drawCactus(ctx: CanvasRenderingContext2D, cactus: Cactus) {
    ctx.fillStyle = '#535353';

    const w = cactus.width;
    const h = cactus.height;
    const x = cactus.x;
    const y = cactus.y;

    // Cuerpo principal del cactus
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);

    if (cactus.type === 'large') {
      // Ramas izquierda
      ctx.fillRect(x, y + h * 0.3, w * 0.3, h * 0.15);
      ctx.fillRect(x, y + h * 0.6, w * 0.3, h * 0.15);
      // Ramas derecha
      ctx.fillRect(x + w * 0.7, y + h * 0.3, w * 0.3, h * 0.15);
      ctx.fillRect(x + w * 0.7, y + h * 0.6, w * 0.3, h * 0.15);
    } else {
      // Ramas pequeñas
      ctx.fillRect(x + w * 0.05, y + h * 0.4, w * 0.25, h * 0.12);
      ctx.fillRect(x + w * 0.7, y + h * 0.4, w * 0.25, h * 0.12);
    }
  }

  drawGround(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    // Textura del suelo
    ctx.fillStyle = '#a0a0a0';
    for (let i = 0; i < CANVAS_WIDTH; i += 15) {
      ctx.fillRect(i, GROUND_Y + 4, 4, 1);
    }
  }

  drawScore(ctx: CanvasRenderingContext2D) {
    const state = this.gameState();

    ctx.fillStyle = '#535353';
    ctx.font = '18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('HI ' + String(state.highScore).padStart(5, '0'), CANVAS_WIDTH - 20, 30);
    ctx.fillText(String(Math.floor(state.score)).padStart(5, '0'), CANVAS_WIDTH - 20, 50);
    ctx.textAlign = 'left';
  }

  drawGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#535353';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.font = '18px monospace';
    ctx.fillText('Presiona ESPACIO para reiniciar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

    ctx.textAlign = 'left';
  }

  drawStartScreen(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#535353';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DINO RUNNER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    ctx.font = '18px monospace';
    ctx.fillText('Presiona ESPACIO para comenzar', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    // Dinosaurio decorativo
    ctx.fillStyle = '#535353';
    ctx.fillRect(CANVAS_WIDTH / 2 - 20, CANVAS_HEIGHT / 2 + 40, 40, 50);
    ctx.fillRect(CANVAS_WIDTH / 2 - 10, CANVAS_HEIGHT / 2 + 25, 30, 15);
    ctx.fillStyle = 'white';
    ctx.fillRect(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 28, 4, 5);

    ctx.textAlign = 'left';
  }
}
