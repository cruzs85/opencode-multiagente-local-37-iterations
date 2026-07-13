import { Injectable, signal, computed } from '@angular/core';
import { ScoreService } from './score.service';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'small' | 'medium' | 'large';
}

export interface DinoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Constantes
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly GROUND_Y = 350;
  private readonly DINO_WIDTH = 40;
  private readonly DINO_HEIGHT = 50;

  // Signals privados
  private readonly _gameState = signal<'idle' | 'playing' | 'gameover'>('idle');
  private readonly _dinoY = signal(0);
  private readonly _dinoVelocityY = signal(0);
  private readonly _isJumping = signal(false);
  private readonly _jumpCount = signal(0);
  private readonly _obstacles = signal<Obstacle[]>([]);
  private readonly _gameSpeed = signal(5);
  private readonly _score = signal(0);
  private readonly _gameOver = signal(false);

  // Signals públicos readonly
  readonly gameState = this._gameState.asReadonly();
  readonly dinoY = this._dinoY.asReadonly();
  readonly dinoVelocityY = this._dinoVelocityY.asReadonly();
  readonly isJumping = this._isJumping.asReadonly();
  readonly jumpCount = this._jumpCount.asReadonly();
  readonly obstacles = this._obstacles.asReadonly();
  readonly gameSpeed = this._gameSpeed.asReadonly();
  readonly score = this._score.asReadonly();
  readonly gameOver = this._gameOver.asReadonly();

  constructor(private scoreService: ScoreService) {}

  startGame(): void {
    this.resetGame();
    this._gameState.set('playing');
    // Iniciar game loop
    this.gameLoop(0);
  }

  jump(): void {
    if (this._jumpCount() < 2) {
      this._dinoVelocityY.set(this.JUMP_FORCE);
      this._jumpCount.update(count => count + 1);
      this._isJumping.set(true);
    }
  }

  gameLoop(deltaTime: number): void {
    if (this._gameState() !== 'playing') return;

    // Actualizar posición del dinosaurio
    this._dinoVelocityY.update(v => v + this.GRAVITY);
    this._dinoY.update(y => y + this._dinoVelocityY());

    // Verificar si el dinosaurio está en el suelo
    if (this._dinoY() >= this.GROUND_Y) {
      this._dinoY.set(this.GROUND_Y - this.DINO_HEIGHT);
      this._dinoVelocityY.set(0);
      this._isJumping.set(false);
      this._jumpCount.set(0);
    }

    // Generar obstáculos
    this.generateObstacle();

    // Actualizar obstáculos
    this._obstacles.update(obstacles => {
      const updatedObstacles = obstacles.map(obs => ({
        ...obs,
        x: obs.x - this._gameSpeed()
      })).filter(obs => obs.x > -obs.width);

      // Verificar colisiones
      const dinoRect = this.getDinoRect();
      for (const obstacle of updatedObstacles) {
        if (this.checkCollision(dinoRect, obstacle)) {
          this.setGameOver();
          return updatedObstacles;
        }
      }

      return updatedObstacles;
    });

    // Aumentar velocidad y puntuación
    this._gameSpeed.update(speed => speed + 0.001);
    this._score.update(score => score + 1);
    this.scoreService.updateScore(1);
  }

  generateObstacle(): void {
    const lastObstacle = this._obstacles()[this._obstacles().length - 1];
    const minDistance = 300 + Math.random() * 200; // entre 300 y 500 pixels
    
    if (this._obstacles().length === 0 || (lastObstacle && lastObstacle.x < 800 - minDistance)) {
      const obstacleTypes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      let width = 0;
      let height = 0;
      
      switch (type) {
        case 'small':
          width = 20;
          height = 40;
          break;
        case 'medium':
          width = 30;
          height = 50;
          break;
        case 'large':
          width = 40;
          height = 60;
          break;
      }
      
      const newObstacle: Obstacle = {
        x: 800,
        y: this.GROUND_Y - height,
        width,
        height,
        type
      };
      
      this._obstacles.update(obstacles => [...obstacles, newObstacle]);
    }
  }

  checkCollision(dino: DinoRect, obstacle: Obstacle): boolean {
    return (
      dino.x < obstacle.x + obstacle.width &&
      dino.x + dino.width > obstacle.x &&
      dino.y < obstacle.y + obstacle.height &&
      dino.y + dino.height > obstacle.y
    );
  }

  resetGame(): void {
    this._gameState.set('idle');
    this._dinoY.set(this.GROUND_Y - this.DINO_HEIGHT);
    this._dinoVelocityY.set(0);
    this._isJumping.set(false);
    this._jumpCount.set(0);
    this._obstacles.set([]);
    this._gameSpeed.set(5);
    this._score.set(0);
    this._gameOver.set(false);
    this.scoreService.resetScore();
  }

  setGameOver(): void {
    this._gameOver.set(true);
    this._gameState.set('gameover');
    this.scoreService.saveHighScore();
  }

  getGroundY(): number {
    return this.GROUND_Y;
  }

  getDinoRect(): DinoRect {
    return {
      x: 100,
      y: this._dinoY(),
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT
    };
  }
}
