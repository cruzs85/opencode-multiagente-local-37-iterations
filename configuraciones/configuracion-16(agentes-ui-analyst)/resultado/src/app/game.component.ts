import { Component, inject, viewChild, ElementRef, afterNextRender, DestroyRef } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  protected gameService = inject(GameService);
  private destroyRef = inject(DestroyRef);

  // Referencias a signals para el template HTML
  protected readonly gamePhase = this.gameService.gamePhase;
  protected readonly score = this.gameService.score;
  protected readonly highScore = this.gameService.highScore;

  // Canvas
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('gameCanvas');
  private ctx: CanvasRenderingContext2D | null = null;

  // Dimensiones fijas del canvas
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 300;
  private readonly GROUND_Y = 250;

  // Frame counter para animación de patas
  private frameCount = 0;

  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      this.setupInput();
      this.startRenderLoop();
    });
  }

  private initCanvas(): void {
    const canvas = this.canvasRef().nativeElement;
    canvas.width = this.CANVAS_WIDTH;
    canvas.height = this.CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d');
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.handleAction();
      }
    };
    const handleClick = () => this.handleAction();
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      this.handleAction();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch, { passive: false });

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
      this.gameService.destroy();
    });
  }

  private handleAction(): void {
    const phase = this.gamePhase();
    if (phase === 'welcome') {
      this.gameService.startGame();
    } else if (phase === 'playing') {
      this.gameService.jump();
    } else if (phase === 'gameOver') {
      this.gameService.startGame();
    }
  }

  private startRenderLoop(): void {
    const render = () => {
      this.renderFrame();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  private renderFrame(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    this.drawGround(ctx);
    this.drawObstacles(ctx);
    this.drawDino(ctx);
    this.drawScore(ctx);

    this.frameCount++;
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    const gy = this.GROUND_Y;

    // Línea del suelo principal
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(this.CANVAS_WIDTH, gy);
    ctx.stroke();

    // Pequeñas marcas en el suelo que se mueven para dar sensación de velocidad
    const speed = this.gamePhase() === 'playing' ? this.gameService.speed() : 6;
    const offset = (this.frameCount * speed * 0.3) % 20;
    ctx.fillStyle = '#3a3a3a';
    for (let x = -offset; x < this.CANVAS_WIDTH; x += 20) {
      ctx.fillRect(x, gy + 4, 10, 2);
    }
  }

  private drawDino(ctx: CanvasRenderingContext2D): void {
    const offsetY = this.gameService.dinoOffsetY();
    const dx = GameService.DINO_X;
    const dy = this.GROUND_Y + offsetY - GameService.DINO_HEIGHT;
    const dw = GameService.DINO_WIDTH;
    const dh = GameService.DINO_HEIGHT;

    // Cola
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.moveTo(dx + 4, dy + 14);
    ctx.lineTo(dx - 8, dy + 8);
    ctx.lineTo(dx + 2, dy + 22);
    ctx.closePath();
    ctx.fill();

    // Cuerpo
    ctx.fillStyle = '#6d6d6d';
    ctx.fillRect(dx + 6, dy + 6, dw - 6, dh - 14);

    // Cabeza (extensión hacia adelante)
    ctx.fillStyle = '#6d6d6d';
    ctx.fillRect(dx + dw - 8, dy - 4, 14, 20);

    // Boca
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx + dw + 2, dy + 10, 4, 2);

    // Ojo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx + dw - 2, dy, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(dx + dw, dy + 1, 2, 2);

    // Brazo pequeño
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(dx + 16, dy + 18, 4, 8);

    // Piernas animadas
    ctx.fillStyle = '#4a4a4a';
    const legPhase = Math.floor(this.frameCount / 5) % 2;
    if (legPhase === 0) {
      ctx.fillRect(dx + 10, dy + dh - 12, 7, 12);
      ctx.fillRect(dx + 22, dy + dh - 6, 7, 6);
    } else {
      ctx.fillRect(dx + 10, dy + dh - 6, 7, 6);
      ctx.fillRect(dx + 22, dy + dh - 12, 7, 12);
    }
  }

  private drawObstacles(ctx: CanvasRenderingContext2D): void {
    const obstacles = this.gameService.obstacles();
    for (const obs of obstacles) {
      const x = obs.x;
      const y = this.GROUND_Y - obs.height;
      const isTall = obs.height > 40;

      // Cuerpo principal del cactus
      ctx.fillStyle = '#2d7a2d';
      ctx.fillRect(x, y, obs.width, obs.height);

      // Borde superior más claro
      ctx.fillStyle = '#4bc34b';
      ctx.fillRect(x, y, obs.width, 4);

      // Textura: líneas verticales
      ctx.fillStyle = '#3aa53a';
      ctx.fillRect(x + 4, y + 6, 3, obs.height - 10);
      ctx.fillRect(x + obs.width - 7, y + 6, 3, obs.height - 10);

      // Ramas laterales
      if (isTall) {
        ctx.fillRect(x - 6, y + 10, 6, 8);
        ctx.fillRect(x + obs.width, y + 16, 6, 8);
      } else {
        ctx.fillRect(x - 4, y + 8, 4, 6);
        ctx.fillRect(x + obs.width, y + 12, 4, 6);
      }
    }
  }

  private drawScore(ctx: CanvasRenderingContext2D): void {
    // Puntuación actual
    ctx.fillStyle = '#a0a0b0';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'right';
    const scoreText = String(Math.floor(this.score())).padStart(5, '0');
    ctx.fillText(scoreText, this.CANVAS_WIDTH - 20, 30);

    // Récord
    const hs = this.highScore();
    if (hs > 0) {
      ctx.fillStyle = '#606070';
      ctx.font = '12px monospace';
      ctx.fillText(`HI ${String(hs).padStart(5, '0')}`, this.CANVAS_WIDTH - 20, 46);
    }
  }
}