import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { HighScoreService } from './high-score.service';

export type GameState = 'idle' | 'playing' | 'gameOver';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly GROUND_Y = 350;
  private readonly DINO_X = 50;
  private readonly DINO_WIDTH = 30;
  private readonly DINO_HEIGHT = 40;
  private readonly INITIAL_SPEED = 5;
  private readonly SPEED_INCREMENT = 0.5;
  private readonly SPEED_LIMIT = 15;
  private readonly POINTS_PER_500 = 500;

  // Game state
  private gameState = signal<GameState>('idle');
  gameStateSignal = this.gameState.asReadonly();

  // Dino state
  private dinoY = signal<number>(this.GROUND_Y);
  private dinoVelocity = signal<number>(0);
  private jumps = signal<number>(0);
  dinoYSignal = this.dinoY.asReadonly();
  jumpsSignal = this.jumps.asReadonly();

  // Game objects
  private obstacles = signal<{ x: number; width: number; height: number }[]>([]);
  private score = signal<number>(0);
  private speed = signal<number>(this.INITIAL_SPEED);
  scoreSignal = this.score.asReadonly();
  speedSignal = this.speed.asReadonly();
  obstaclesSignal = this.obstacles.asReadonly();

  // Physics loop
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private obstacleSpawnTimer = 0;
  private readonly OBSTACLE_SPAWN_INTERVAL = 1500; // ms

  private readonly highScoreService = inject(HighScoreService);

  constructor() {
    // Initialize the game state
    this.gameState.set('idle');
  }

  start(): void {
    if (this.gameState() === 'playing') {
      return;
    }
    
    this.gameState.set('playing');
    this.reset();
    
    // Start the game loop
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  jump(): void {
    if (this.gameState() !== 'playing') {
      return;
    }

    // Allow double jump
    if (this.jumps() < 2) {
      this.dinoVelocity.set(this.JUMP_FORCE);
      this.jumps.update(count => count + 1);
    }
  }

  stop(): void {
    this.gameState.set('gameOver');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Save score
    this.highScoreService.saveHighScore(this.score());
  }

  reset(): void {
    this.dinoY.set(this.GROUND_Y - this.DINO_HEIGHT);
    this.dinoVelocity.set(0);
    this.jumps.set(0);
    this.obstacles.set([]);
    this.score.set(0);
    this.speed.set(this.INITIAL_SPEED);
    this.obstacleSpawnTimer = 0;
  }

  private gameLoop(timestamp: number): void {
    if (this.gameState() !== 'playing') {
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Update dino position with gravity
    this.dinoVelocity.update(velocity => velocity + this.GRAVITY);
    this.dinoY.update(y => {
      const newY = y + this.dinoVelocity();
      
      // Ground collision
      if (newY > this.GROUND_Y - this.DINO_HEIGHT) {
        this.dinoVelocity.set(0);
        this.jumps.set(0);
        return this.GROUND_Y - this.DINO_HEIGHT;
      }
      
      return newY;
    });

    // Update obstacles
    this.obstacles.update(obstacles => {
      // Move obstacles
      const updatedObstacles = obstacles.map(obstacle => ({
        ...obstacle,
        x: obstacle.x - this.speed()
      }));

      // Remove obstacles that are off-screen
      return updatedObstacles.filter(obstacle => obstacle.x > -obstacle.width);
    });

    // Update score
    this.score.update(score => score + 1);

    // Increase speed every 500 points
    const newSpeed = this.INITIAL_SPEED + Math.floor(this.score() / this.POINTS_PER_500) * this.SPEED_INCREMENT;
    this.speed.set(Math.min(newSpeed, this.SPEED_LIMIT));

    // Spawn new obstacles
    this.obstacleSpawnTimer += deltaTime;
    if (this.obstacleSpawnTimer > this.OBSTACLE_SPAWN_INTERVAL) {
      this.spawnObstacle();
      this.obstacleSpawnTimer = 0;
    }

    // Check collisions
    this.checkCollisions();

    // Continue the game loop
    this.animationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private spawnObstacle(): void {
    // Random obstacle size (width 20-40, height 30-60)
    const width = Math.floor(Math.random() * 21) + 20; // 20-40
    const height = Math.floor(Math.random() * 31) + 30; // 30-60
    
    this.obstacles.update(obstacles => [
      ...obstacles,
      { x: 800, width, height }
    ]);
  }

  private checkCollisions(): void {
    const dinoRect = {
      x: this.DINO_X,
      y: this.dinoY(),
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT
    };

    // Check collision with obstacles
    for (const obstacle of this.obstacles()) {
      const obstacleRect = {
        x: obstacle.x,
        y: this.GROUND_Y - obstacle.height,
        width: obstacle.width,
        height: obstacle.height
      };

      // AABB collision with 2px margin
      if (this.isColliding(dinoRect, obstacleRect, 2)) {
        this.stop();
        return;
      }
    }
  }

  private isColliding(rect1: { x: number; y: number; width: number; height: number }, 
                     rect2: { x: number; y: number; width: number; height: number }, 
                     margin: number): boolean {
    return rect1.x < rect2.x + rect2.width + margin && 
           rect1.x + rect1.width + margin > rect2.x &&
           rect1.y < rect2.y + rect2.height + margin &&
           rect1.y + rect1.height + margin > rect2.y;
  }
}