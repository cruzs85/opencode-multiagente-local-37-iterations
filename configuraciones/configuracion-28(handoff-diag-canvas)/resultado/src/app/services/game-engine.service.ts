import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';
import { ScoreStorageService } from './score-storage.service';

@Injectable({
  providedIn: 'root'
})
export class GameEngineService {
  private scoreStorage = inject(ScoreStorageService);

  gameState = signal<'idle' | 'playing' | 'gameOver'>('idle');
  score = signal<number>(0);
  speed = signal<number>(5);
  highScore = signal<number>(this.scoreStorage.getHighScore());
  dinosaurY = signal<number>(0);
  isJumping = signal<boolean>(false);
  jumpCount = signal<number>(0);
  obstacles = signal<Array<{x: number, width: number, height: number}>>([]);

  startGame() {
    this.gameState.set('playing');
    this.score.set(0);
    this.speed.set(5);
    this.obstacles.set([]);
    this.dinosaurY.set(0);
    this.jumpCount.set(0);
  }

  resetGame() {
    this.gameState.set('idle');
  }

  gameOver() {
    this.gameState.set('gameOver');
    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      this.scoreStorage.setHighScore(this.score());
    }
  }

  jump() {
    if (this.jumpCount() < 2) {
      this.jumpCount.update(count => count + 1);
      this.isJumping.set(true);
    }
  }

  updateGame() {
    this.score.update(score => score + 1);
    
    // Increase speed every 500 points
    if (this.score() % 500 === 0 && this.score() > 0) {
      this.increaseSpeed();
    }

    // Move obstacles
    this.obstacles.update(obstacles => {
      const updatedObstacles = obstacles.map(obs => ({ ...obs, x: obs.x - this.speed() }));
      return updatedObstacles.filter(obs => obs.x > -obs.width);
    });

    // Generate new obstacles
    if (Math.random() < 0.02) { // 2% chance per frame
      this.obstacles.update(obstacles => [
        ...obstacles,
        {
          x: 800,
          width: 20,
          height: 40 + Math.random() * 30
        }
      ]);
    }

    // Apply gravity
    if (this.isJumping()) {
      this.dinosaurY.update(y => y + this.speed());
      if (this.dinosaurY() >= 0) {
        this.dinosaurY.set(0);
        this.isJumping.set(false);
        this.jumpCount.set(0);
      }
    }

    // Collision detection
    const dinoX = 10;
    const dinoWidth = 20;
    const dinoHeight = 40;

    for (const obstacle of this.obstacles()) {
      if (obstacle.x < dinoX + dinoWidth && 
          obstacle.x + obstacle.width > dinoX && 
          obstacle.height > dinoHeight - this.dinosaurY()) {
        this.gameOver();
        break;
      }
    }
  }

  increaseSpeed() {
    this.speed.update(s => s + 0.5);
  }
}