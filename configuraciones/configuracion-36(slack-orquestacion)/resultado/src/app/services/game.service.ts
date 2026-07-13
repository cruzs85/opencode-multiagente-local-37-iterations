import { Injectable, signal } from '@angular/core';

interface Dino {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'bird';
  passed: boolean;
}

interface GameState {
  score: number;
  gameOver: boolean;
  isPlaying: boolean;
  speed: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  // Game state signals
  score = signal<number>(0);
  isGameOver = signal<boolean>(false);
  isPlaying = signal<boolean>(false);
  speed = signal<number>(6);

  // Dino state
  dinoY = signal<number>(250);
  jumpCount = signal<number>(0);
  velocityY = signal<number>(0);

  // Obstacles array
  obstacles = signal<Obstacle[]>([]);

  // Game constants
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 300;
  private readonly GROUND_Y = 250;
  private readonly DINO_WIDTH = 40;
  private readonly DINO_HEIGHT = 40;
  private readonly GRAVITY = 0.8;
  private readonly JUMP_FORCE_1 = -16;
  private readonly JUMP_FORCE_2 = -12;
  private readonly OBSTACLE_SPAWN_MIN_RATE = 60; // frames between obstacles
  private readonly OBSTACLE_SPAWN_MAX_RATE = 120;

  // Obstacle counter
  obstacleCount = signal<number>(0);

  private obstacleSpawnCounter = 0;

  constructor() {}

  startGame(): void {
    this.reset();
    this.isPlaying.set(true);
    this.isGameOver.set(false);
    this.score.set(0);
    this.speed.set(6);
    this.dinoY.set(this.GROUND_Y - this.DINO_HEIGHT);
    this.velocityY.set(0);
    this.jumpCount.set(0);
    this.obstacles.set([]);
    this.obstacleCount.set(0);
    this.obstacleSpawnCounter = 0;
    // NO llamar gameLoop() aquí
  }

  jump(): void {
    if (!this.isPlaying() || this.isGameOver()) return;
    if (this.jumpCount() < 2) {
      const jumpForce = this.jumpCount() === 0 ? this.JUMP_FORCE_1 : this.JUMP_FORCE_2;
      this.velocityY.set(jumpForce);
      this.jumpCount.update(count => count + 1);
    }
  }

  update(): void {
    if (!this.isPlaying() || this.isGameOver()) return;

    // Apply gravity to velocity
    this.velocityY.update(v => v + this.GRAVITY);
    
    // Apply velocity to position
    this.dinoY.update(y => y + this.velocityY());

    // Ground collision
    const groundLevel = this.GROUND_Y - this.DINO_HEIGHT;
    if (this.dinoY() >= groundLevel) {
      this.dinoY.set(groundLevel);
      this.velocityY.set(0);
      this.jumpCount.set(0);
    }

    // Increase score every frame (distance-based)
    this.score.update(s => s + 1);

    // Update obstacles
    this.obstacles.update(obstacles => {
      const updatedObstacles = obstacles.map(obs => ({
        ...obs,
        x: obs.x - this.speed()
      })).filter(obs => obs.x > -obs.width);

      // Eliminado: this.score.update(s => s + 1); - ahora se incrementa en cada frame

      return updatedObstacles;
    });

    // >>>>> Check collisions (AABB) <<<<<
    const dinoX = 50;
    const dinoY = this.dinoY();
    const dinoW = this.DINO_WIDTH;
    const dinoH = this.DINO_HEIGHT;

    for (const obstacle of this.obstacles()) {
      if (
        dinoX < obstacle.x + obstacle.width &&
        dinoX + dinoW > obstacle.x &&
        dinoY < obstacle.y + obstacle.height &&
        dinoY + dinoH > obstacle.y
      ) {
        this.gameOver();
        return;  // Stop update immediately
      }
    }

    // Spawn new obstacles
    this.obstacleSpawnCounter++;
    const spawnRate = Math.floor(Math.random() * (this.OBSTACLE_SPAWN_MAX_RATE - this.OBSTACLE_SPAWN_MIN_RATE + 1)) + this.OBSTACLE_SPAWN_MIN_RATE;
    if (this.obstacleSpawnCounter >= spawnRate) {
      this.spawnObstacle();
      this.obstacleSpawnCounter = 0;
    }

    // Increase speed
    this.speed.update(s => s + 0.01);
  }

  private spawnObstacle(): void {
    const obstacleTypes: ('cactus' | 'bird')[] = ['cactus', 'bird'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

    let width, height, y;

    if (type === 'cactus') {
      const isLarge = Math.random() > 0.7;
      width = isLarge ? 30 : 20;
      height = isLarge ? 50 : 40;
      y = this.GROUND_Y - height;
    } else {
      width = 40;
      height = 30;
      y = this.GROUND_Y - 80;  // Pájaro más bajo pero aéreo (was -100)
    }

    const newObstacle: Obstacle = {
      x: this.CANVAS_WIDTH,
      y,
      width,
      height,
      type,
      passed: false
    };

    this.obstacles.update(obs => [...obs, newObstacle]);
    this.obstacleCount.update(c => c + 1);
  }

  gameOver(): void {
    this.isPlaying.set(false);
    this.isGameOver.set(true);
  }

  reset(): void {
    this.isPlaying.set(false);
    this.isGameOver.set(false);
    this.score.set(0);
    this.speed.set(6);
    this.dinoY.set(this.GROUND_Y - this.DINO_HEIGHT);
    this.velocityY.set(0);
    this.jumpCount.set(0);
    this.obstacles.set([]);
    this.obstacleCount.set(0);
    this.obstacleSpawnCounter = 0;
  }

  // Eliminar este método completamente
  // private gameLoop(): void {
  //   if (!this.isPlaying() || this.isGameOver()) return;
  //
  //   this.update();
  //
  //   // Check collisions (basic AABB)
  //   const dino: Dino = {
  //     x: 50,
  //     y: this.dinoY(),
  //     width: this.DINO_WIDTH,
  //     height: this.DINO_HEIGHT,
  //     velocityY: 0,
  //     isJumping: false,
  //     jumpCount: this.jumpCount()
  //   };
  //
  //   // Check collisions with obstacles
  //   for (const obstacle of this.obstacles()) {
  //     if (
  //       dino.x < obstacle.x + obstacle.width &&
  //       dino.x + dino.width > obstacle.x &&
  //       dino.y < obstacle.y + obstacle.height &&
  //       dino.y + dino.height > obstacle.y
  //     ) {
  //       this.gameOver();
  //       break;
  //     }
  //   }
  //
  //   this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  // }

  getDinoState(): { x: number; y: number; width: number; height: number; jumpCount: number } {
    return {
      x: 50,
      y: this.dinoY(),
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT,
      jumpCount: this.jumpCount()
    };
  }

  getGroundY(): number {
    return this.GROUND_Y;
  }

  // Expose signals as readonly for components to subscribe to
  getScore = this.score.asReadonly;
  getIsGameOver = this.isGameOver.asReadonly;
  getIsPlaying = this.isPlaying.asReadonly;
  getSpeed = this.speed.asReadonly;
  getObstacles = this.obstacles.asReadonly;
}