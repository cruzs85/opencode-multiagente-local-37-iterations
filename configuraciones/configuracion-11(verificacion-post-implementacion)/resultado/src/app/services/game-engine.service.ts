import { Injectable, signal, afterNextRender, Injector, inject } from '@angular/core';
import { GameState, GameStatus, Dino, Obstacle } from '../models/game.models';
import { ScoreService } from './score.service';

@Injectable({ providedIn: 'root' })
export class GameEngineService {
  private readonly _gameState = signal<GameState>(this.createInitialState());
  readonly gameState = this._gameState.asReadonly();

  private readonly _isRunning = signal<boolean>(false);
  readonly isRunning = this._isRunning.asReadonly();

  private scoreService = inject(ScoreService);
  private injector = inject(Injector);

  private animationFrameId: number | null = null;
  private lastTime = 0;
  private lastObstacleTime = 0;
  private context: CanvasRenderingContext2D | null = null;

  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 350;
  private readonly INITIAL_SPEED = 6;
  private readonly MAX_SPEED = 16;
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly GROUND_Y = 300;

  private createInitialState(): GameState {
    return {
      status: GameStatus.Welcome,
      score: 0,
      highScore: 0,
      dino: {
        x: 80,
        y: this.GROUND_Y - 50,
        width: 40,
        height: 50,
        vy: 0,
        isJumping: false,
        jumpCount: 0
      },
      obstacles: [],
      speed: this.INITIAL_SPEED,
      groundY: this.GROUND_Y,
      gameTime: 0
    };
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.context = canvas.getContext('2d');
  }

  startGame(): void {
    const state = this.createInitialState();
    state.status = GameStatus.Playing;
    this.scoreService.init();
    state.highScore = this.scoreService.loadScore();
    this._gameState.set(state);
    this._isRunning.set(true);
    this.lastObstacleTime = performance.now();

    afterNextRender(() => {
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }, { injector: this.injector });
  }

  jump(): void {
    const state = this._gameState();
    if (state.status !== GameStatus.Playing) return;

    if (state.dino.jumpCount < 2) {
      state.dino.vy = this.JUMP_FORCE;
      state.dino.isJumping = true;
      state.dino.jumpCount++;
      if (state.dino.jumpCount === 1) {
        state.dino.y -= 5;
      }
      this._gameState.set({ ...state });
    }
  }

  resetGame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this._isRunning.set(false);
    this._gameState.set(this.createInitialState());
  }

  destroy(): void {
    this._isRunning.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.context = null;
  }

  private gameLoop(timestamp: number): void {
    if (!this._isRunning()) return;

    const deltaTime = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.render();

    if (this._isRunning()) {
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  private update(deltaTime: number): void {
    const state = this._gameState();
    if (state.status !== GameStatus.Playing) return;

    // Actualizar tiempo y velocidad
    state.gameTime += deltaTime;
    state.speed = Math.min(this.MAX_SPEED, this.INITIAL_SPEED + state.gameTime * 0.3);

    // Aplicar gravedad
    state.dino.vy += this.GRAVITY;
    state.dino.y += state.dino.vy;

    // Suelo
    const floorY = state.groundY - state.dino.height;
    if (state.dino.y >= floorY) {
      state.dino.y = floorY;
      state.dino.vy = 0;
      state.dino.isJumping = false;
      state.dino.jumpCount = 0;
    }

    // Puntuación
    state.score += Math.floor(state.speed * deltaTime * 10);

    // Generar obstáculos
    const now = performance.now();
    const minInterval = Math.max(400, this.MIN_OBSTACLE_INTERVAL - state.gameTime * 20);
    const maxInterval = Math.max(800, this.MAX_OBSTACLE_INTERVAL - state.gameTime * 30);
    const interval = minInterval + Math.random() * (maxInterval - minInterval);

    if (now - this.lastObstacleTime > interval) {
      this.spawnObstacle(state);
      this.lastObstacleTime = now;
    }

    // Mover obstáculos y eliminar fuera de pantalla
    state.obstacles = state.obstacles.filter((obs) => {
      obs.x -= state.speed;
      return obs.x + obs.width > -50;
    });

    // Detectar colisiones
    for (const obs of state.obstacles) {
      if (this.checkCollision(state.dino, obs)) {
        this.gameOver();
        return;
      }
    }

    this._gameState.set({ ...state });
  }

  private get MIN_OBSTACLE_INTERVAL(): number { return 800; }
  private get MAX_OBSTACLE_INTERVAL(): number { return 2000; }

  private spawnObstacle(state: GameState): void {
    const isCactus = Math.random() < 0.7;
    const width = isCactus ? 20 + Math.floor(Math.random() * 11) : 25 + Math.floor(Math.random() * 11);
    const height = isCactus ? 35 + Math.floor(Math.random() * 16) : 20 + Math.floor(Math.random() * 11);

    state.obstacles.push({
      x: this.CANVAS_WIDTH,
      y: state.groundY - height,
      width,
      height,
      type: isCactus ? 'cactus' : 'rock'
    });
  }

  private checkCollision(dino: Dino, obstacle: Obstacle): boolean {
    const margin = 5;
    return (
      dino.x < obstacle.x + obstacle.width - margin &&
      dino.x + dino.width - margin > obstacle.x &&
      dino.y < obstacle.y + obstacle.height - margin &&
      dino.y + dino.height - margin > obstacle.y
    );
  }

  private gameOver(): void {
    this._isRunning.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const state = this._gameState();
    state.status = GameStatus.GameOver;
    this.scoreService.saveScore(state.score);
    this._gameState.set({ ...state });
  }

  private render(): void {
    if (!this.context) return;
    const ctx = this.context;
    const state = this._gameState();

    ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Cielo
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

    // Suelo
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, state.groundY, this.CANVAS_WIDTH, 4);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, state.groundY + 4, this.CANVAS_WIDTH, 16);

    // Línea discontinua en el suelo
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, state.groundY + 4);
    ctx.lineTo(this.CANVAS_WIDTH, state.groundY + 4);
    ctx.stroke();
    ctx.setLineDash([]);

    // Obstáculos
    for (const obs of state.obstacles) {
      this.renderObstacle(ctx, obs);
    }

    // Dinosaurio
    this.renderDino(ctx, state.dino, state);

    // Game Over
    if (state.status === GameStatus.GameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 40);

      ctx.font = '20px monospace';
      ctx.fillText(`Puntuación: ${state.score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 10);
      ctx.fillText(`Récord: ${state.highScore}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 40);

      ctx.font = '16px monospace';
      ctx.fillText('Presiona ESPACIO o haz clic para reiniciar', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 80);
    }
  }

  private renderDino(ctx: CanvasRenderingContext2D, dino: Dino, state: GameState): void {
    // Cuerpo
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Ojo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dino.x + dino.width - 12, dino.y + 10, 8, 8);
    ctx.fillStyle = '#000000';
    ctx.fillRect(dino.x + dino.width - 10, dino.y + 12, 4, 4);

    // Boca
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dino.x + dino.width - 6, dino.y + 22, 4, 2);

    // Patas (animación simple)
    const legOffset = state.gameTime * 10 % 20 < 10 ? 0 : 4;
    ctx.fillStyle = '#535353';
    if (dino.isJumping) {
      // Patas retraídas (saltando)
      ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 5);
      ctx.fillRect(dino.x + dino.width - 13, dino.y + dino.height, 8, 5);
    } else {
      // Patas alternando (corriendo)
      ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 8 + legOffset);
      ctx.fillRect(dino.x + dino.width - 13, dino.y + dino.height, 8, 8 - legOffset);
      if (legOffset > 0) {
        ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 8 - legOffset);
        ctx.fillRect(dino.x + dino.width - 13, dino.y + dino.height, 8, 8 + legOffset);
      }
    }
  }

  private renderObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle): void {
    if (obs.type === 'cactus') {
      // Tronco
      ctx.fillStyle = '#2d8a4e';
      ctx.fillRect(obs.x + 4, obs.y, obs.width - 8, obs.height);
      // Brazos
      ctx.fillRect(obs.x, obs.y + obs.height * 0.3, obs.width, 6);
      ctx.fillRect(obs.x, obs.y + obs.height * 0.6, obs.width, 6);
    } else {
      // Roca
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(obs.x, obs.y + obs.height * 0.2, obs.width, obs.height * 0.8);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(obs.x + 2, obs.y + obs.height * 0.3, obs.width - 4, obs.height * 0.5);
    }
  }
}
