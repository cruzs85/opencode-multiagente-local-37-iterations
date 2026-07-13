import { Injectable, effect, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { HighScoreService } from './high-score.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private highScoreService = inject(HighScoreService);

  // Game state signals
  gameState = signal<'idle' | 'playing' | 'game-over'>('idle');
  score = signal(0);
  speed = signal(6);
  dinoY = signal(0);
  dinoJumpCount = signal(0);
  obstacles = signal<{ x: number; width: number; height: number; type: string }[]>([]);
  highScore = computed(() => this.highScoreService.highScore());

  // Game constants
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 400;
  private readonly DINO_WIDTH = 40;
  private readonly DINO_HEIGHT = 40;
  private readonly GROUND_Y = this.CANVAS_HEIGHT - this.DINO_HEIGHT;
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = 12;
  private readonly INITIAL_SPEED = 6;
  private readonly SPEED_INCREMENT = 0.5;
  private readonly SPEED_INCREMENT_THRESHOLD = 500;
  private readonly OBSTACLE_INTERVAL_MIN = 60;
  private readonly OBSTACLE_INTERVAL_MAX = 120;

  // Game loop
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private obstacleTimer: number = 0;
  private lastScoreUpdate: number = 0;

  startGame(): void {
    if (this.gameState() === 'playing') return;

    // Reset game state
    this.score.set(0);
    this.speed.set(this.INITIAL_SPEED);
    this.dinoY.set(0);
    this.dinoJumpCount.set(0);
    this.obstacles.set([]);
    this.gameState.set('playing');

    // Start game loop
    this.lastTime = performance.now();
    this.obstacleTimer = 0;
    this.lastScoreUpdate = 0;
    this.gameLoop();
  }

  jump(): void {
    if (this.gameState() !== 'playing') return;

    if (this.dinoJumpCount() < 2) {
      this.dinoY.update(y => y + this.JUMP_FORCE);
      this.dinoJumpCount.update(count => count + 1);
    }
  }

  stopGame(): void {
    this.gameState.set('game-over');
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Save high score if needed
    if (this.score() > (this.highScore() ?? 0)) {
      this.highScoreService.saveHighScore(this.score());
    }
  }

  getStateSnapshot() {
    return {
      gameState: this.gameState(),
      score: this.score(),
      speed: this.speed(),
      dinoY: this.dinoY(),
      dinoJumpCount: this.dinoJumpCount(),
      obstacles: [...this.obstacles()],
      highScore: this.highScore()
    };
  }

  private gameLoop(timestamp: number = 0): void {
    if (this.gameState() !== 'playing') return;

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Update score
    this.score.update(score => score + 1);

    // Update speed every 500 points
    if (this.score() >= this.lastScoreUpdate + this.SPEED_INCREMENT_THRESHOLD) {
      this.speed.update(speed => speed + this.SPEED_INCREMENT);
      this.lastScoreUpdate = this.score();
    }

    // Update dino position (gravity)
    this.dinoY.update(y => {
      const newY = y - this.GRAVITY;
      if (newY <= 0) {
        // Reset to ground
        this.dinoJumpCount.set(0);
        return 0;
      }
      return newY;
    });

    // Update obstacles
    this.obstacles.update(obstacles => {
      // Move obstacles
      const updatedObstacles = obstacles.map(obs => ({ ...obs, x: obs.x - this.speed() }));

      // Remove obstacles that are off screen
      return updatedObstacles.filter(obs => obs.x + obs.width > 0);
    });

    // Generate new obstacles
    this.obstacleTimer++;
    if (this.obstacleTimer >= this.OBSTACLE_INTERVAL_MIN + Math.random() * (this.OBSTACLE_INTERVAL_MAX - this.OBSTACLE_INTERVAL_MIN)) {
      this.obstacles.update(obstacles => {
        const newObstacle = {
          x: this.CANVAS_WIDTH,
          width: 20 + Math.random() * 20,
          height: 40 + Math.random() * 40,
          type: Math.random() > 0.5 ? 'cactus' : 'bird'
        };
        return [...obstacles, newObstacle];
      });
      this.obstacleTimer = 0;
    }

    // Check collisions
    this.checkCollisions();

    // Continue game loop
    this.animationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  private checkCollisions(): void {
    const dinoX = 50;
    const dinoRect = {
      x: dinoX,
      y: this.CANVAS_HEIGHT - this.DINO_HEIGHT - this.dinoY(),
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT
    };

    for (const obstacle of this.obstacles()) {
      const obstacleRect = {
        x: obstacle.x,
        y: this.CANVAS_HEIGHT - obstacle.height,
        width: obstacle.width,
        height: obstacle.height
      };

      if (this.isCollision(dinoRect, obstacleRect)) {
        this.stopGame();
        return;
      }
    }
  }

  private isCollision(rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}