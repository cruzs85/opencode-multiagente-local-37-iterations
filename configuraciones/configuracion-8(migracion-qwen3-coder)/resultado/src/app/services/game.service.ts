import { Injectable, signal, inject } from '@angular/core';
import { ScoreService } from './score.service';
import {
  GameState,
  Dinosaur,
  Obstacle,
  GROUND_Y,
  GRAVITY,
  JUMP_FORCE,
  INITIAL_SPEED,
  MAX_SPEED,
  SPEED_INCREMENT,
  OBSTACLE_MIN_GAP,
  DINO_START_X
} from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly _gameState = signal<GameState>({
    dinosaur: {
      x: DINO_START_X,
      y: GROUND_Y,
      width: 40,
      height: 40,
      velocityY: 0,
      jumpCount: 0,
      isJumping: false,
      isRunning: true
    },
    obstacles: [],
    score: 0,
    highScore: 0,
    gameSpeed: INITIAL_SPEED,
    isGameOver: false,
    isRunning: false,
    isStarted: false,
    groundOffset: 0
  });

  private animationFrameId: number | null = null;
  private lastObstacleX: number = 0;
  private readonly scoreService = inject(ScoreService);

  readonly gameState = this._gameState.asReadonly();

  startGame(): void {
    this.resetGame();
    this._gameState.update(state => ({
      ...state,
      highScore: this.scoreService.highScore(),
      isRunning: true,
      isStarted: true
    }));
    this.gameLoop();
  }

  jump(): void {
    if (!this._gameState().isRunning || this._gameState().isGameOver) {
      return;
    }

    if (this._gameState().dinosaur.jumpCount < 2) {
      this._gameState.update(state => {
        const dino = state.dinosaur;
        return {
          ...state,
          dinosaur: {
            ...dino,
            velocityY: JUMP_FORCE,
            jumpCount: dino.jumpCount + 1,
            isJumping: dino.jumpCount === 0
          }
        };
      });
    }
  }

  gameLoop(): void {
    if (!this._gameState().isRunning) return;

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    this.update();
  }

  stopGame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this._gameState.update(state => ({
      ...state,
      isRunning: false
    }));
  }

  resetGame(): void {
    this.stopGame();
    this._gameState.set(this.createInitialState());
    this._gameState.update(state => ({
      ...state,
      isStarted: false
    }));
  }

  private update(): void {
    this._gameState.update(state => {
      const { dinosaur, obstacles, score, gameSpeed, isGameOver, isRunning, isStarted, groundOffset } = state;
      
      // Update score
      const newScore = score + 0.1;
      
      // Update speed
      const newGameSpeed = Math.min(gameSpeed + SPEED_INCREMENT, MAX_SPEED);
      
      // Update dinosaur physics
      let newDino = { ...dinosaur };
      
      // Apply gravity always
      newDino.velocityY += GRAVITY;
      newDino.y += newDino.velocityY;

      // Clamp to ground
      if (newDino.y >= GROUND_Y) {
        newDino.y = GROUND_Y;
        newDino.velocityY = 0;
        newDino.jumpCount = 0;
        newDino.isJumping = false;
      }
      
      // Update ground offset
      const newGroundOffset = groundOffset + newGameSpeed;
      
// Move obstacles first
      let newObstacles = obstacles.map(obs => ({ ...obs, x: obs.x - newGameSpeed }));

      // Track the rightmost obstacle's position after movement
      if (newObstacles.length > 0) {
        this.lastObstacleX = Math.max(...newObstacles.map(o => o.x));
      } else {
        this.lastObstacleX = 0;
      }

      // Generate new obstacle if no obstacles or the last one is far enough left
      if (newObstacles.length === 0 || this.lastObstacleX < 800 - OBSTACLE_MIN_GAP) {
        const obstacle = this.generateObstacle();
        newObstacles.push(obstacle);
        this.lastObstacleX = obstacle.x;
      }

      // Remove off-screen obstacles
      newObstacles = newObstacles.filter(obs => obs.x > -50);

      // Mark passed obstacles
      newObstacles = newObstacles.map(obs => {
        if (obs.x + obs.width < newDino.x && !obs.passed) {
          return { ...obs, passed: true };
        }
        return obs;
      });

      // Collision detection
      let gameOver = isGameOver;
      for (const obs of newObstacles) {
        if (this.checkCollision(newDino, obs)) {
          gameOver = true;
          break;
        }
      }

      // Update high score
      let newHighScore = state.highScore;
      if (newScore > newHighScore) {
        newHighScore = newScore;
      }

      if (gameOver) {
        this.handleGameOver();
      }

      return {
        ...state,
        dinosaur: newDino,
        obstacles: newObstacles,
        score: newScore,
        gameSpeed: newGameSpeed,
        isGameOver: gameOver,
        groundOffset: newGroundOffset,
        highScore: newHighScore
      };
    });
  }

  private generateObstacle(): Obstacle {
    const isBird = Math.random() < 0.2;
    const type = isBird ? 'bird' : 'cactus';
    const height = isBird ? 20 : 40;
    const width = isBird ? 30 : 20;
    const y = isBird ? GROUND_Y - 80 : GROUND_Y - 30;
    
    return {
      type,
      x: 800,
      y,
      width,
      height,
      passed: false
    };
  }

  private checkCollision(dino: Dinosaur, obstacle: Obstacle): boolean {
    // Using a margin of 5px in each direction for a more generous hitbox
    const margin = 5;
    
    return (
      dino.x + margin < obstacle.x + obstacle.width &&
      dino.x + dino.width - margin > obstacle.x &&
      dino.y + margin < obstacle.y + obstacle.height &&
      dino.y + dino.height - margin > obstacle.y
    );
  }

  private handleGameOver(): void {
    this._gameState.update(state => ({
      ...state,
      isGameOver: true,
      isRunning: false
    }));
    
    this.stopGame();
    
    const roundedScore = Math.round(this._gameState().score);
    if (roundedScore > this.scoreService.highScore()) {
      this.scoreService.saveHighScore(roundedScore);
    }
  }

  private createInitialState(): GameState {
    return {
      dinosaur: {
        x: DINO_START_X,
        y: GROUND_Y,
        width: 40,
        height: 40,
        velocityY: 0,
        jumpCount: 0,
        isJumping: false,
        isRunning: true
      },
      obstacles: [],
      score: 0,
      highScore: 0,
      gameSpeed: INITIAL_SPEED,
      isGameOver: false,
      isRunning: false,
      isStarted: false,
      groundOffset: 0
    };
  }
}