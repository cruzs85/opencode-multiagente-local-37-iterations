import { Injectable, signal } from '@angular/core';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  readonly gameActive = signal<boolean>(false);
  readonly dino = signal<DinoState>({
    x: 50,
    y: 0,
    width: 30,
    height: 40,
    velocityY: 0,
    isJumping: false,
    jumpCount: 0
  });
  readonly obstacles = signal<Obstacle[]>([]);
  readonly speed = signal<number>(200);
  readonly score = signal<number>(0);
  readonly groundY = signal<number>(0);

  private readonly GRAVITY = 800;
  private readonly JUMP_FORCE = -400;
  private readonly MAX_JUMPS = 2;
  private readonly BASE_SPEED = 200;
  private readonly SPEED_INCREMENT = 5;
  private readonly OBSTACLE_SPAWN_MIN = 1000;
  private readonly OBSTACLE_SPAWN_MAX = 2500;
  private lastSpawnTime = 0;
  private nextSpawnDelay = 0;
  private gameTime = 0;

  startGame(): void {
    this.gameActive.set(true);
    this.dino.set({ x: 50, y: 0, width: 30, height: 40, velocityY: 0, isJumping: false, jumpCount: 0 });
    this.obstacles.set([]);
    this.speed.set(this.BASE_SPEED);
    this.score.set(0);
    this.lastSpawnTime = 0;
    this.nextSpawnDelay = this.randomSpawnDelay();
    this.gameTime = 0;
  }

  stopGame(): void {
    this.gameActive.set(false);
  }

  jump(): void {
    const dino = this.dino();
    if (dino.jumpCount < this.MAX_JUMPS) {
      this.dino.update(d => ({
        ...d,
        velocityY: this.JUMP_FORCE,
        isJumping: true,
        jumpCount: d.jumpCount + 1
      }));
    }
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    if (!this.gameActive()) return;

    this.gameTime += deltaTime;
    const groundY = canvasHeight - 50;
    this.groundY.set(groundY);

    // Update speed
    this.speed.update(s => this.BASE_SPEED + Math.floor(this.gameTime * this.SPEED_INCREMENT / 1000));

    // Update dino physics
    this.dino.update(d => {
      let newY = d.y + d.velocityY * deltaTime;
      let newVelocityY = d.velocityY + this.GRAVITY * deltaTime;
      let newJumpCount = d.jumpCount;
      let newIsJumping = d.isJumping;

      if (newY >= groundY - d.height) {
        newY = groundY - d.height;
        newVelocityY = 0;
        newIsJumping = false;
        newJumpCount = 0;
      }

      return {
        ...d,
        y: newY,
        velocityY: newVelocityY,
        isJumping: newIsJumping,
        jumpCount: newJumpCount
      };
    });

    // Spawn obstacles
    this.lastSpawnTime += deltaTime * 1000;
    if (this.lastSpawnTime >= this.nextSpawnDelay) {
      this.lastSpawnTime = 0;
      this.nextSpawnDelay = this.randomSpawnDelay();
      const minHeight = 20;
      const maxHeight = 50;
      const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      const width = Math.floor(Math.random() * 10) + 20;
      this.obstacles.update(obs => [
        ...obs,
        { x: canvasWidth, y: groundY - height, width, height, passed: false }
      ]);
    }

    // Update obstacles
    const currentSpeed = this.speed();
    this.obstacles.update(obs => {
      const updated = obs
        .map(o => ({ ...o, x: o.x - currentSpeed * deltaTime }))
        .filter(o => o.x + o.width > -50);
      
      // Score for passed obstacles
      let scoreAdd = 0;
      for (const o of updated) {
        if (!o.passed && o.x < 50) {
          o.passed = true;
          scoreAdd += 10;
        }
      }
      if (scoreAdd > 0) {
        this.score.update(s => s + scoreAdd);
      }
      return updated;
    });
  }

  checkCollision(): boolean {
    const dino = this.dino();
    const obstacles = this.obstacles();
    for (const obs of obstacles) {
      if (
        dino.x < obs.x + obs.width &&
        dino.x + dino.width > obs.x &&
        dino.y < obs.y + obs.height &&
        dino.y + dino.height > obs.y
      ) {
        return true;
      }
    }
    return false;
  }

  private randomSpawnDelay(): number {
    return Math.floor(Math.random() * (this.OBSTACLE_SPAWN_MAX - this.OBSTACLE_SPAWN_MIN + 1)) + this.OBSTACLE_SPAWN_MIN;
  }
}
