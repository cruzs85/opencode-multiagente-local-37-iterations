import { Injectable, inject, signal } from '@angular/core';
import { GameScreen, GameState, Dino, Obstacle, GameConfig } from '../models/game.types';
import { ScoreService } from './score.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private scoreService = inject(ScoreService);

  // Signals
  screenSignal = signal<GameScreen>('welcome');
  stateSignal = signal<GameState>('idle');
  scoreSignal = signal<number>(0);
  highScoreSignal = signal<number>(this.scoreService.getHighScore());
  isNewRecordSignal = signal<boolean>(false);
  dinoSignal = signal<Dino>({
    x: 50,
    y: GameConfig.GROUND_Y - GameConfig.DINO_HEIGHT,
    width: GameConfig.DINO_WIDTH,
    height: GameConfig.DINO_HEIGHT,
    velocityY: 0,
    jumpCount: 0,
    isGrounded: true
  });
  obstaclesSignal = signal<Obstacle[]>([]);

  // Game loop
  private lastTime: number = 0;
  private gameLoopId: number | null = null;
  private baseSpeed: number = GameConfig.INITIAL_SPEED;

  startGame(): void {
    this.screenSignal.set('game');
    this.stateSignal.set('running');
    this.scoreSignal.set(0);
    this.obstaclesSignal.set([]);
    this.isNewRecordSignal.set(false);
    this.baseSpeed = GameConfig.INITIAL_SPEED;
    this.dinoSignal.set({
      x: 50,
      y: GameConfig.GROUND_Y - GameConfig.DINO_HEIGHT,
      width: GameConfig.DINO_WIDTH,
      height: GameConfig.DINO_HEIGHT,
      velocityY: 0,
      jumpCount: 0,
      isGrounded: true
    });
    this.lastTime = 0;
    this.gameLoopId = requestAnimationFrame((time) => this.update(time));
  }

  pauseGame(): void {
    if (this.stateSignal() === 'running') {
      this.stateSignal.set('paused');
      if (this.gameLoopId) {
        cancelAnimationFrame(this.gameLoopId);
      }
    }
  }

  resumeGame(): void {
    if (this.stateSignal() === 'paused') {
      this.stateSignal.set('running');
      this.lastTime = 0;
      this.gameLoopId = requestAnimationFrame((time) => this.update(time));
    }
  }

  restartGame(): void {
    this.screenSignal.set('game');
    this.stateSignal.set('running');
    this.scoreSignal.set(0);
    this.obstaclesSignal.set([]);
    this.isNewRecordSignal.set(false);
    this.baseSpeed = GameConfig.INITIAL_SPEED;
    this.dinoSignal.set({
      x: 50,
      y: GameConfig.GROUND_Y - GameConfig.DINO_HEIGHT,
      width: GameConfig.DINO_WIDTH,
      height: GameConfig.DINO_HEIGHT,
      velocityY: 0,
      jumpCount: 0,
      isGrounded: true
    });
    this.lastTime = 0;
    this.gameLoopId = requestAnimationFrame((time) => this.update(time));
  }

  gameOver(): void {
    const currentScore = this.scoreSignal();
    const highScore = this.highScoreSignal();
    const isNewRecord = currentScore > highScore;
    this.isNewRecordSignal.set(isNewRecord);
    if (isNewRecord) {
      this.highScoreSignal.set(currentScore);
      this.scoreService.saveHighScore(currentScore);
    }
    this.screenSignal.set('gameOver');
    this.stateSignal.set('gameOver');
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
    }
  }

  jump(): void {
    const dino = this.dinoSignal();
    if (dino.isGrounded || dino.jumpCount < 2) {
      const newDino = { ...dino };
      newDino.velocityY = GameConfig.JUMP_VELOCITY;
      newDino.jumpCount++;
      newDino.isGrounded = false;
      this.dinoSignal.set(newDino);
    }
  }

  update(deltaTime: number): void {
    if (this.stateSignal() !== 'running') {
      return;
    }

    if (this.lastTime === 0) {
      this.lastTime = deltaTime;
    }
    const dt = (deltaTime - this.lastTime) / 1000;
    this.lastTime = deltaTime;

    // Update score
    this.scoreSignal.update(score => score + Math.floor(dt * 60));

    // Update speed based on score
    const score = this.scoreSignal();
    this.baseSpeed = GameConfig.INITIAL_SPEED + Math.floor(score / 100) * GameConfig.SPEED_INCREMENT;

    // Update dino - clone to avoid signal mutation bug
    const dino = this.dinoSignal();
    const newDino = { ...dino };
    newDino.velocityY += GameConfig.GRAVITY * dt;
    newDino.y += newDino.velocityY * dt;

    // Ground collision
    if (newDino.y >= GameConfig.GROUND_Y - GameConfig.DINO_HEIGHT) {
      newDino.y = GameConfig.GROUND_Y - GameConfig.DINO_HEIGHT;
      newDino.velocityY = 0;
      newDino.jumpCount = 0;
      newDino.isGrounded = true;
    }

    this.dinoSignal.set(newDino);

    // Spawn obstacles
    this.spawnObstacle();

    // Update obstacles - clone array to avoid signal mutation bug
    const obstacles = this.obstaclesSignal();
    const newObstacles: Obstacle[] = [];
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      const newObstacle = { ...obstacle };
      newObstacle.x -= newObstacle.speed * dt;

      // Remove passed obstacles
      if (newObstacle.x + newObstacle.width < 0) {
        continue;
      }

      // Check collisions
      this.checkCollisions(newDino, newObstacle);

      newObstacles.push(newObstacle);
    }

    this.obstaclesSignal.set(newObstacles);

    // Continue game loop
    this.gameLoopId = requestAnimationFrame((time) => this.update(time));
  }

  private spawnObstacle(): void {
    const obstacles = this.obstaclesSignal();
    const lastObstacle = obstacles[obstacles.length - 1];

    if (!lastObstacle || lastObstacle.x < GameConfig.CANVAS_WIDTH - 200) {
      const height = Math.floor(Math.random() * 30) + 40; // 40-70
      const width = Math.floor(Math.random() * 15) + 25; // 25-40
      const obstacle: Obstacle = {
        x: GameConfig.CANVAS_WIDTH,
        y: GameConfig.GROUND_Y - height,
        width: width,
        height: height,
        speed: this.baseSpeed,
        passed: false
      };
      this.obstaclesSignal.set([...obstacles, obstacle]);
    }
  }

  private checkCollisions(dino: Dino, obstacle: Obstacle): void {
    if (dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y) {
      this.gameOver();
    }
  }

  removePassedObstacles(): void {
    const obstacles = this.obstaclesSignal();
    const newObstacles = obstacles.filter(obs => obs.x + obs.width >= 0);
    this.obstaclesSignal.set(newObstacles);
  }
}