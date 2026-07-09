import { Injectable, signal, computed, inject } from '@angular/core';
import { ScoreService } from './score.service';

export interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: 'cactus-small' | 'cactus-large';
}

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private readonly _gameState = signal<'welcome' | 'playing' | 'game-over'>('welcome');
  private readonly _dinoY = signal<number>(0); // 0 en el suelo, valores negativos = saltando
  private readonly _dinoFrame = signal<number>(0);
  private readonly _obstacles = signal<Obstacle[]>([]);
  private readonly _speed = signal<number>(6);
  private readonly _distance = signal<number>(0);
  private readonly _frameCount = signal<number>(0);

  private _jumpVelocity = 0;
  private _jumpCount = 0;
  private _isJumping = false;
  private _animationFrameId: number | null = null;
  private _lastObstacleDistance = 0;

  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly DINO_X = 100;
  private readonly MIN_OBSTACLE_INTERVAL = 120;
  private readonly DINO_WIDTH = 44;
  private readonly DINO_HEIGHT = 48;
  private readonly CANVAS_WIDTH = 800;

  readonly gameState = this._gameState.asReadonly();
  readonly dinoY = this._dinoY.asReadonly();
  readonly dinoFrame = this._dinoFrame.asReadonly();
  readonly obstacles = this._obstacles.asReadonly();
  readonly speed = this._speed.asReadonly();
  readonly distance = this._distance.asReadonly();
  readonly score = computed(() => Math.floor(this._distance() / 10));

  private readonly scoreService = inject(ScoreService);

  startGame(): void {
    this._gameState.set('playing');
    this._distance.set(0);
    this._speed.set(6);
    this._obstacles.set([]);
    this._dinoY.set(0);
    this._jumpCount = 0;
    this._isJumping = false;
    this._jumpVelocity = 0;
    this._lastObstacleDistance = 0;
    this.scoreService.resetScore();
    this._gameLoop();
  }

  jump(): void {
    if (this.gameState() === 'playing' && this._jumpCount < 2) {
      this._jumpCount++;
      this._jumpVelocity = this.JUMP_FORCE;
      this._isJumping = true;
    }
  }

  gameOver(): void {
    this._gameState.set('game-over');
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
    }
    this.scoreService.incrementScore(this.score());
  }

  resetGame(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
    }
    this._gameState.set('welcome');
  }

  private _gameLoop(): void {
    this._animationFrameId = requestAnimationFrame(() => {
      if (this.gameState() !== 'playing') {
        return; // No programar más frames si ya no se está jugando
      }

      // Incrementar distancia
      this._distance.update(d => d + this._speed() / 6);

      // Aumentar velocidad
      this._speed.update(s => Math.min(s + 0.002, 20));

      // Física del salto
      if (this._isJumping) {
        this._dinoY.update(y => y + this._jumpVelocity);
        this._jumpVelocity += this.GRAVITY;
        if (this._dinoY() >= 0) {
          this._dinoY.set(0);
          this._isJumping = false;
          this._jumpCount = 0;
        }
      }

      // Spawn de obstáculos
      const interval = Math.max(this.MIN_OBSTACLE_INTERVAL - this._speed() * 5, 60);
      if (this._distance() - this._lastObstacleDistance > interval && this._obstacles().length < 3) {
        const type = Math.random() > 0.5 ? 'cactus-small' : 'cactus-large';
        const width = type === 'cactus-small' ? 20 : 30;
        const height = type === 'cactus-small' ? 35 : 50;
        const newObstacle: Obstacle = {
          x: this.CANVAS_WIDTH + Math.random() * 100,
          width,
          height,
          type
        };
        this._obstacles.update(obstacles => [...obstacles, newObstacle]);
        this._lastObstacleDistance = this._distance();
      }

      // Mover obstáculos
      this._obstacles.update(obstacles => {
        const updatedObstacles = obstacles.map(obs => ({ ...obs, x: obs.x - this._speed() }));
        return updatedObstacles.filter(obs => obs.x + obs.width > 0);
      });

      // Actualizar frame de animación
      this._frameCount.update(c => c + 1);
      if (this._frameCount() % 8 === 0) {
        this._dinoFrame.update(f => f === 0 ? 1 : 0);
      }

      // Colisiones
      const dinoLeft = this.DINO_X;
      const dinoRight = this.DINO_X + this.DINO_WIDTH;
      const dinoTop = -this._dinoY() - this.DINO_HEIGHT;
      const dinoBottom = -this._dinoY();

      for (const obstacle of this._obstacles()) {
        const obsLeft = obstacle.x;
        const obsRight = obstacle.x + obstacle.width;
        const obsTop = -obstacle.height;
        const obsBottom = 0;

        if (dinoLeft < obsRight && dinoRight > obsLeft && dinoTop < obsBottom && dinoBottom > obsTop) {
          this.gameOver();
          return; // Sale del callback de rAF - no programa más frames
        }
      }

      // Continuar solo si sigue jugando
      this._gameLoop();
    });
  }
}
