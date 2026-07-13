import { Injectable, Injector, signal, effect, inject } from '@angular/core';

/** Obstáculo en coordenadas del juego (y=0 es el suelo, positivo hacia abajo) */
export interface Obstacle {
  x: number;
  width: number;
  height: number;
}

export type GamePhase = 'welcome' | 'playing' | 'gameOver';

@Injectable({ providedIn: 'root' })
export class GameService {
  private injector = inject(Injector);

  // === CONSTANTES ===
  static readonly DINO_X = 50;
  static readonly DINO_WIDTH = 36;
  static readonly DINO_HEIGHT = 48;

  private readonly GRAVITY = 0.65;
  private readonly JUMP_FORCE = -13;
  private readonly INITIAL_SPEED = 6;
  private readonly MAX_SPEED = 20;
  private readonly SPEED_INCREMENT = 0.0008;

  // === SIGNALS PÚBLICAS ===
  private readonly _gamePhase = signal<GamePhase>('welcome');
  readonly gamePhase = this._gamePhase.asReadonly();

  /** Puntuación actual */
  private readonly _score = signal(0);
  readonly score = this._score.asReadonly();

  /** Récord histórico (persistido en localStorage) */
  private readonly _highScore = signal(0);
  readonly highScore = this._highScore.asReadonly();

  /** Velocidad actual del juego */
  private readonly _speed = signal(this.INITIAL_SPEED);
  readonly speed = this._speed.asReadonly();

  /** Desplazamiento vertical del dino respecto al suelo (0 = en suelo, negativo = arriba) */
  private readonly _dinoOffsetY = signal(0);
  readonly dinoOffsetY = this._dinoOffsetY.asReadonly();

  /** Lista de obstáculos activos */
  private readonly _obstacles = signal<Obstacle[]>([]);
  readonly obstacles = this._obstacles.asReadonly();

  // === ESTADO INTERNO (no reactivo, por rendimiento) ===
  private dinoVelocity = 0;
  private jumpCount = 0;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;
  private obstacleSpawnCounter = 0;
  private nextObstacleAt = 0;
  private runningScore = 0;

  constructor() {
    this._highScore.set(this.loadHighScore());

    // Persistir high score cuando cambie
    effect(() => {
      const hs = this._highScore();
      if (hs > 0) {
        this.saveHighScore(hs);
      }
    }, { injector: this.injector });
  }

  /** Inicia una partida desde cero */
  startGame(): void {
    this.destroy();
    this.resetInternalState();
    this._gamePhase.set('playing');
    this._score.set(0);
    this._speed.set(this.INITIAL_SPEED);
    this._obstacles.set([]);
    this._dinoOffsetY.set(0);
    this.runningScore = 0;
    this.lastTimestamp = 0;
    this.obstacleSpawnCounter = 0;
    this.nextObstacleAt = this.getRandomInterval();
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  /** Ejecuta un salto (máximo 2 saltos consecutivos sin tocar suelo) */
  jump(): void {
    if (this._gamePhase() !== 'playing') return;
    if (this.jumpCount >= 2) return;
    this.dinoVelocity = this.JUMP_FORCE;
    this.jumpCount++;
  }

  /** Vuelve a la pantalla de bienvenida */
  goToWelcome(): void {
    this.destroy();
    this._gamePhase.set('welcome');
    this._score.set(0);
    this._speed.set(this.INITIAL_SPEED);
    this._obstacles.set([]);
    this._dinoOffsetY.set(0);
  }

  /** Limpia recursos (llamar desde DestroyRef del componente) */
  destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // === GAME LOOP ===

  private gameLoop(timestamp: number): void {
    if (this._gamePhase() !== 'playing') return;

    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
    }

    const dt = Math.min(timestamp - this.lastTimestamp, 33.33); // cap para evitar saltos
    this.lastTimestamp = timestamp;

    this.updatePhysics(dt);
    this.updateObstacles(dt);
    this.updateScore(dt);
    this.checkCollision();

    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  private updatePhysics(dt: number): void {
    const dtNorm = dt * 0.06; // normalizar a ~60fps

    // Gravedad
    this.dinoVelocity += this.GRAVITY * dtNorm;
    const newOffset = this._dinoOffsetY() + this.dinoVelocity * dtNorm;

    if (newOffset >= 0) {
      // Aterrizó
      this._dinoOffsetY.set(0);
      this.dinoVelocity = 0;
      this.jumpCount = 0;
    } else {
      this._dinoOffsetY.set(newOffset);
    }
  }

  private updateObstacles(dt: number): void {
    const speed = this._speed();
    const dtNorm = dt * 0.06;

    // Incrementar velocidad progresivamente
    const newSpeed = Math.min(speed + this.SPEED_INCREMENT * dtNorm, this.MAX_SPEED);
    this._speed.set(newSpeed);

    // Generar obstáculos
    this.obstacleSpawnCounter++;
    if (this.obstacleSpawnCounter >= this.nextObstacleAt) {
      this.spawnObstacle();
      this.obstacleSpawnCounter = 0;
      this.nextObstacleAt = this.getRandomInterval();
    }

    // Mover obstáculos (de derecha a izquierda)
    const current = this._obstacles();
    const moved = current
      .map(obs => ({ ...obs, x: obs.x - speed * dtNorm }))
      .filter(obs => obs.x + obs.width > -50);
    this._obstacles.set(moved);
  }

  private updateScore(dt: number): void {
    const speed = this._speed();
    const dtNorm = dt * 0.06;
    this.runningScore += speed * dtNorm * 0.1;
    this._score.set(Math.floor(this.runningScore));
  }

  private spawnObstacle(): void {
    const height = Math.random() > 0.4 ? 50 : 34;
    const width = height > 40 ? 22 : 18;
    const obstacle: Obstacle = {
      x: 900,
      width,
      height
    };
    this._obstacles.update(obs => [...obs, obstacle]);
  }

  private checkCollision(): void {
    const offsetY = this._dinoOffsetY();
    const dinoLeft = GameService.DINO_X + 4;
    const dinoRight = GameService.DINO_X + GameService.DINO_WIDTH - 4;
    const dinoTop = offsetY - GameService.DINO_HEIGHT + 4;
    const dinoBottom = offsetY - 4;

    const obstacles = this._obstacles();
    for (const obs of obstacles) {
      const obsLeft = obs.x + 2;
      const obsRight = obs.x + obs.width - 2;
      const obsTop = -obs.height + 4;
      const obsBottom = -4;

      // AABB collision
      if (dinoLeft < obsRight && dinoRight > obsLeft) {
        if (dinoTop < obsBottom && dinoBottom > obsTop) {
          this.gameOver();
          return;
        }
      }
    }
  }

  private gameOver(): void {
    this._gamePhase.set('gameOver');
    this.destroy();
    if (this.runningScore > this._highScore()) {
      this._highScore.set(this.runningScore);
    }
  }

  // === HELPERS ===

  private getRandomInterval(): number {
    const speedFactor = this._speed() / this.INITIAL_SPEED;
    const min = Math.max(20, Math.floor(80 / speedFactor));
    const max = Math.max(40, Math.floor(160 / speedFactor));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private resetInternalState(): void {
    this.dinoVelocity = 0;
    this.jumpCount = 0;
    this.runningScore = 0;
    this.obstacleSpawnCounter = 0;
    this.nextObstacleAt = 0;
    this.lastTimestamp = 0;
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem('dino-runner-highscore', score.toString());
    } catch {
      // Ignorar si localStorage no disponible
    }
  }

  private loadHighScore(): number {
    try {
      const stored = localStorage.getItem('dino-runner-highscore');
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }
}
