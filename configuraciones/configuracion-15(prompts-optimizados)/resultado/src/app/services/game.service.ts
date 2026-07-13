import { Injectable, signal, computed, Injector } from '@angular/core';
import { GamePhase, DinoState, Obstacle, GAME_CONSTANTS } from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // === Signals privados ===
  private readonly _phase = signal<GamePhase>('welcome');
  private readonly _dino = signal<DinoState>(this.createInitialDino());
  private readonly _obstacles = signal<Obstacle[]>([]);
  private readonly _speed = signal(GAME_CONSTANTS.BASE_SPEED);
  private readonly _score = signal(0);
  private readonly _highScore = signal(0);
  private readonly _groundOffset = signal(0);
  private readonly _gameOver = signal(false);
  private readonly _frameCount = signal(0);
  private readonly _isRunning = signal(false);

  // === Signals públicos (readonly) ===
  readonly phase = this._phase.asReadonly();
  readonly dino = this._dino.asReadonly();
  readonly obstacles = this._obstacles.asReadonly();
  readonly speed = this._speed.asReadonly();
  readonly score = this._score.asReadonly();
  readonly highScore = this._highScore.asReadonly();
  readonly groundOffset = this._groundOffset.asReadonly();
  readonly gameOver = this._gameOver.asReadonly();
  readonly isRunning = this._isRunning.asReadonly();

  // === Variables internas ===
  private obstacleTimer = 0;
  private frameTime = 0;
  private scoreAccumulator = 0;

  constructor() {
    this.loadHighScore();
  }

  /** Inicia una nueva partida */
  startGame(): void {
    this._phase.set('playing');
    this._gameOver.set(false);
    this._dino.set(this.createInitialDino());
    this._obstacles.set([]);
    this._speed.set(GAME_CONSTANTS.BASE_SPEED);
    this._score.set(0);
    this._groundOffset.set(0);
    this._isRunning.set(true);
    this.obstacleTimer = 0;
    this.frameTime = 0;
    this.scoreAccumulator = 0;
  }

  /** Ejecuta un salto del dinosaurio */
  jump(): void {
    const dino = this._dino();
    if (this._phase() !== 'playing') return;

    if (!dino.isJumping) {
      // Primer salto
      this._dino.set({
        ...dino,
        velocityY: GAME_CONSTANTS.JUMP_VELOCITY,
        isJumping: true,
        jumpCount: 1,
      });
    } else if (dino.jumpCount < 2) {
      // Segundo salto (doble salto)
      this._dino.set({
        ...dino,
        velocityY: GAME_CONSTANTS.DOUBLE_JUMP_VELOCITY,
        jumpCount: 2,
      });
    }
  }

  /** Actualiza el estado del juego. Llamar desde requestAnimationFrame */
  update(deltaTime: number): void {
    if (this._phase() !== 'playing' || this._gameOver()) return;

    const dt = Math.min(deltaTime, 33); // Cap a 33ms (~30fps mínimo)

    this.frameTime += dt;
    this._frameCount.update(c => c + 1);

    // Actualizar velocidad progresiva
    this.updateSpeed(dt);

    // Actualizar dinosaurio (física)
    this.updateDino(dt);

    // Generar obstáculos
    this.updateObstacleGeneration(dt);

    // Mover obstáculos
    this.updateObstacles(dt);

    // Verificar colisiones
    this.checkCollisions();

    // Actualizar puntuación
    this.updateScore(dt);

    // Actualizar offset del suelo (scrolling)
    this._groundOffset.update((offset) => (offset + this._speed() * dt * 0.05) % 20);
  }

  /** Reinicia el juego al estado inicial (pantalla de bienvenida) */
  resetGame(): void {
    this._phase.set('welcome');
    this._gameOver.set(false);
    this._isRunning.set(false);
    this._dino.set(this.createInitialDino());
    this._obstacles.set([]);
    this._speed.set(GAME_CONSTANTS.BASE_SPEED);
    this._score.set(0);
    this._groundOffset.set(0);
    this.obstacleTimer = 0;
    this.frameTime = 0;
    this.scoreAccumulator = 0;
  }

  // === Métodos privados ===

  private createInitialDino(): DinoState {
    return {
      x: GAME_CONSTANTS.DINO_X,
      y: GAME_CONSTANTS.GROUND_Y - GAME_CONSTANTS.DINO_HEIGHT,
      width: GAME_CONSTANTS.DINO_WIDTH,
      height: GAME_CONSTANTS.DINO_HEIGHT,
      velocityY: 0,
      isJumping: false,
      jumpCount: 0,
      legFrame: 0,
    };
  }

  private updateDino(dt: number): void {
    const dino = this._dino();

    if (dino.isJumping) {
      const newVelocity = dino.velocityY + GAME_CONSTANTS.GRAVITY;
      const newY = dino.y + newVelocity;

      // Si llegó al suelo
      if (newY >= GAME_CONSTANTS.GROUND_Y - dino.height) {
        this._dino.set({
          ...dino,
          y: GAME_CONSTANTS.GROUND_Y - dino.height,
          velocityY: 0,
          isJumping: false,
          jumpCount: 0,
        });
      } else {
        this._dino.set({
          ...dino,
          y: newY,
          velocityY: newVelocity,
        });
      }
    } else {
      // Animación de piernas mientras corre
      this._dino.update((d) => ({
        ...d,
        legFrame: this._frameCount() % 20 < 10 ? 1 : 0,
      }));
    }
  }

  private updateSpeed(dt: number): void {
    this._speed.update((s) => {
      const newSpeed = s + GAME_CONSTANTS.SPEED_INCREMENT * dt;
      const clampedSpeed = Math.min(GAME_CONSTANTS.MAX_SPEED, newSpeed);
      return clampedSpeed as 6;
    });
  }

  private updateObstacleGeneration(dt: number): void {
    this.obstacleTimer += dt;

    const currentSpeed = this._speed();
    const minGap = Math.max(60, GAME_CONSTANTS.OBSTACLE_MIN_GAP - currentSpeed * 5);
    const maxGap = Math.max(100, GAME_CONSTANTS.OBSTACLE_MAX_GAP - currentSpeed * 5);
    const neededTime = minGap + Math.random() * (maxGap - minGap);

    if (this.obstacleTimer >= neededTime) {
      this.generateObstacle();
      this.obstacleTimer = 0;
    }
  }

  private generateObstacle(): void {
    const currentSpeed = this._speed();
    // Random: 70% cactus pequeño, 20% cactus grande, 10% bird (ave)
    const rand = Math.random();
    let obstacle: Obstacle;

    if (rand < 0.7) {
      obstacle = {
        x: GAME_CONSTANTS.CANVAS_WIDTH,
        y: GAME_CONSTANTS.GROUND_Y - 35,
        width: 20,
        height: 35,
        type: 'cactus-small',
      };
    } else if (rand < 0.9) {
      obstacle = {
        x: GAME_CONSTANTS.CANVAS_WIDTH,
        y: GAME_CONSTANTS.GROUND_Y - 50,
        width: 30,
        height: 50,
        type: 'cactus-large',
      };
    } else {
      obstacle = {
        x: GAME_CONSTANTS.CANVAS_WIDTH,
        y: GAME_CONSTANTS.GROUND_Y - 30 - Math.random() * 40,
        width: 30,
        height: 20,
        type: 'bird',
      };
    }

    this._obstacles.update((obs) => [...obs, obstacle]);
  }

  private updateObstacles(dt: number): void {
    const currentSpeed = this._speed();
    const step = currentSpeed * dt * 0.06;

    this._obstacles.update((obs) =>
      obs
        .map((o) => ({ ...o, x: o.x - step }))
        .filter((o) => o.x > -50)
    );
  }

  private checkCollisions(): void {
    const dino = this._dino();
    const obstacles = this._obstacles();

    const dinoLeft = dino.x + 5; // hitbox más pequeña que el sprite
    const dinoRight = dino.x + dino.width - 5;
    const dinoTop = dino.y + 5;
    const dinoBottom = dino.y + dino.height;

    for (const obs of obstacles) {
      const obsLeft = obs.x + 3;
      const obsRight = obs.x + obs.width - 3;
      const obsTop = obs.y + 3;
      const obsBottom = obs.y + obs.height;

      if (dinoRight > obsLeft && dinoLeft < obsRight && dinoBottom > obsTop && dinoTop < obsBottom) {
        this.gameOverSequence();
        return;
      }
    }
  }

  private gameOverSequence(): void {
    this._gameOver.set(true);
    this._isRunning.set(false);
    this._phase.set('game-over');
    this.saveHighScore();
  }

  private updateScore(dt: number): void {
    this.scoreAccumulator += this._speed() * dt * 0.01;
    if (this.scoreAccumulator >= 1) {
      const points = Math.floor(this.scoreAccumulator);
      this._score.update((s) => s + points);
      this.scoreAccumulator -= points;
    }
  }

  private saveHighScore(): void {
    const currentScore = this._score();
    const currentHigh = this._highScore();
    if (currentScore > currentHigh) {
      this._highScore.set(currentScore);
      localStorage.setItem('dino-runner-highscore', currentScore.toString());
    }
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem('dino-runner-highscore');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        this._highScore.set(parsed);
      }
    }
  }
}