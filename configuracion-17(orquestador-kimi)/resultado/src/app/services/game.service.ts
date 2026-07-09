import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface Obstacle {
  x: number;
  width: number;
  height: number;
}

export type GameState = 'welcome' | 'playing' | 'gameover';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly _gameState = signal<GameState>('welcome');
  private readonly _score = signal<number>(0);
  private readonly _speed = signal<number>(300);
  private readonly _dinoY = signal<number>(0);
  private readonly _isJumping = signal<boolean>(false);
  private readonly _jumpCount = signal<number>(0);
  private readonly _obstacles = signal<Obstacle[]>([]);
  private readonly _highScore = signal<number>(0);

  readonly gameState = this._gameState.asReadonly();
  readonly score = this._score.asReadonly();
  readonly speed = this._speed.asReadonly();
  readonly dinoY = this._dinoY.asReadonly();
  readonly isJumping = this._isJumping.asReadonly();
  readonly jumpCount = this._jumpCount.asReadonly();
  readonly obstacles = this._obstacles.asReadonly();
  readonly highScore = this._highScore.asReadonly();

  private velocityY = 0;
  private gameLoopId: number | null = null;
  private lastTimestamp: number | null = null;
  private obstacleSpawnTimer = 0;
  private scoreTimer = 0;
  private speedIncreaseTimer = 0;

  // Constantes del juego
  private readonly GRAVITY = 1800;        // px/s²
  private readonly JUMP_VELOCITY = 520;   // px/s (positivo = arriba)
  private readonly GROUND_Y = 0;
  private readonly DINO_WIDTH = 40;
  private readonly DINO_HEIGHT = 50;
  private readonly DINO_X = 80;
  private readonly GAME_WIDTH = 800;
  private readonly BASE_SPAWN_INTERVAL = 2000; // ms
  private readonly SPEED_INCREMENT = 25;
  private readonly SPEED_INCREASE_INTERVAL = 5000; // ms

  constructor(private storageService: StorageService) {
    this._highScore.set(this.storageService.highScore());
  }

  startGame(): void {
    if (this._gameState() === 'welcome' || this._gameState() === 'gameover') {
      this._gameState.set('playing');
      this._score.set(0);
      this._speed.set(300);
      this._dinoY.set(this.GROUND_Y);
      this._isJumping.set(false);
      this._jumpCount.set(0);
      this._obstacles.set([]);
      this.velocityY = 0;
      this.obstacleSpawnTimer = 0;
      this.scoreTimer = 0;
      this.speedIncreaseTimer = 0;
      this.lastTimestamp = null;
      this.gameLoopId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
  }

  jump(): void {
    if (this._gameState() !== 'playing') return;

    if (this._jumpCount() < 2) {
      this._isJumping.set(true);
      this.velocityY = this.JUMP_VELOCITY;
      this._jumpCount.set(this._jumpCount() + 1);
    }
  }

  resetGame(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
    this._gameState.set('welcome');
    this.velocityY = 0;
  }

  private gameLoop(timestamp: number): void {
    if (this._gameState() !== 'playing') return;

    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }

    const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this.updatePhysics(deltaTime);
    this.updateObstacles(deltaTime);
    this.updateScore(deltaTime);
    this.updateSpeed(deltaTime);
    this.checkCollision();

    if (this._gameState() === 'playing') {
      this.gameLoopId = requestAnimationFrame((ts) => this.gameLoop(ts));
    }
  }

  private updatePhysics(deltaTime: number): void {
    if (this._gameState() !== 'playing') return;

    if (this._isJumping()) {
      this.velocityY -= this.GRAVITY * deltaTime;
      this._dinoY.set(this._dinoY() + this.velocityY * deltaTime);

      if (this._dinoY() <= this.GROUND_Y) {
        this._dinoY.set(this.GROUND_Y);
        this._isJumping.set(false);
        this._jumpCount.set(0);
        this.velocityY = 0;
      }
    }
  }

  private updateObstacles(deltaTime: number): void {
    if (this._gameState() !== 'playing') return;

    const currentObstacles = this._obstacles();
    const newObstacles: Obstacle[] = [];

    for (const obs of currentObstacles) {
      const newX = obs.x - this._speed() * deltaTime;
      if (newX + obs.width > 0) {
        newObstacles.push({ ...obs, x: newX });
      }
    }

    this._obstacles.set(newObstacles);

    this.obstacleSpawnTimer += deltaTime * 1000;
    const spawnInterval = Math.max(1200, this.BASE_SPAWN_INTERVAL - this._score() * 5);
    if (this.obstacleSpawnTimer >= spawnInterval) {
      this.spawnObstacle();
      this.obstacleSpawnTimer = 0;
    }
  }

  private spawnObstacle(): void {
    const width = 20 + Math.random() * 25;
    const height = 30 + Math.random() * 40;
    this._obstacles.update(obs => [
      ...obs,
      { x: this.GAME_WIDTH + Math.random() * 100, width, height }
    ]);
  }

  private updateScore(deltaTime: number): void {
    this.scoreTimer += deltaTime;
    if (this.scoreTimer >= 0.1) {
      this._score.set(this._score() + 1);
      this.scoreTimer -= 0.1;
    }
  }

  private updateSpeed(deltaTime: number): void {
    this.speedIncreaseTimer += deltaTime * 1000;
    if (this.speedIncreaseTimer >= this.SPEED_INCREASE_INTERVAL) {
      this._speed.set(this._speed() + this.SPEED_INCREMENT);
      this.speedIncreaseTimer -= this.SPEED_INCREASE_INTERVAL;
    }
  }

  private checkCollision(): void {
    if (this._gameState() !== 'playing') return;

    const dinoY = this._dinoY();

    for (const obstacle of this._obstacles()) {
      const horizontalOverlap =
        obstacle.x < this.DINO_X + this.DINO_WIDTH &&
        obstacle.x + obstacle.width > this.DINO_X;

      const verticalOverlap = dinoY < obstacle.height;

      if (horizontalOverlap && verticalOverlap) {
        this._gameState.set('gameover');
        this.storageService.saveHighScore(this._score());
        this._highScore.set(this.storageService.highScore());
        if (this.gameLoopId !== null) {
          cancelAnimationFrame(this.gameLoopId);
          this.gameLoopId = null;
        }
        return;
      }
    }
  }
}