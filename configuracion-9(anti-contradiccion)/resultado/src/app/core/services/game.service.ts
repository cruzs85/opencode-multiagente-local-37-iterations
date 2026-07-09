import { Injectable, signal } from '@angular/core';
import { DinoState, Obstacle, GameStatus } from '../../models/obstacle.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private _status = signal<GameStatus>('welcome');
  public status = this._status.asReadonly();

  private _score = signal<number>(0);
  public score = this._score.asReadonly();

  private _highScore = signal<number>(0);
  public highScore = this._highScore.asReadonly();

  private _dino = signal<DinoState>({
    x: 50,
    y: 300,
    width: 40,
    height: 50,
    velocityY: 0,
    groundY: 300,
    jumpCount: 0
  });
  public dino = this._dino.asReadonly();

  private _obstacles: Obstacle[] = [];
  public obstacles = signal<Obstacle[]>(this._obstacles);

  private gameSpeed = 5;
  private gravity = 0.8;
  private jumpStrength = -15;
  private isJumping = false;
  private lastObstacleTime = 0;
  private obstacleInterval = 1500;

  startGame(): void {
    this._status.set('playing');
    this._score.set(0);
    this.resetDino();
    this._obstacles = [];
    this.obstacles.set(this._obstacles);
    this.lastObstacleTime = 0;
  }

  restart(): void {
    this._status.set('welcome');
  }

  jump(): void {
    if (this._status() !== 'playing') return;
    
    if (this._dino().jumpCount < 2) {
      this._dino.update(dino => ({
        ...dino,
        velocityY: this.jumpStrength,
        jumpCount: dino.jumpCount + 1
      }));
    }
  }

  update(deltaTime: number): void {
    if (this._status() !== 'playing') return;

    // Actualizar puntaje
    this._score.update(score => score + 1);

    // Actualizar dinosaurio
    this.updateDino();

    // Generar obstáculos
    this.generateObstacles();

    // Actualizar obstáculos
    this.updateObstacles();

    // Verificar colisiones
    this.checkCollisions();
  }

  private resetDino(): void {
    this._dino.set({
      x: 50,
      y: 300,
      width: 40,
      height: 50,
      velocityY: 0,
      groundY: 300,
      jumpCount: 0
    });
  }

  private updateDino(): void {
    this._dino.update(dino => {
      let newY = dino.y + dino.velocityY;
      let newVelocityY = dino.velocityY + this.gravity;
      let jumpCount = dino.jumpCount;

      // Verificar si el dinosaurio está en el suelo
      if (newY >= dino.groundY) {
        newY = dino.groundY;
        newVelocityY = 0;
        jumpCount = 0;
      }

      return {
        ...dino,
        y: newY,
        velocityY: newVelocityY,
        jumpCount
      };
    });
  }

  private generateObstacles(): void {
    const now = Date.now();
    if (now - this.lastObstacleTime > this.obstacleInterval) {
      const obstacleTypes: Obstacle['type'][] = ['cactus', 'small-cactus', 'bird', 'group-cactus'];
      const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      let obstacle: Obstacle;
      
      switch (randomType) {
        case 'cactus':
          obstacle = {
            type: 'cactus',
            x: 800,
            y: 300,
            width: 20,
            height: 50,
            speed: this.gameSpeed
          };
          break;
        case 'small-cactus':
          obstacle = {
            type: 'small-cactus',
            x: 800,
            y: 320,
            width: 15,
            height: 30,
            speed: this.gameSpeed
          };
          break;
        case 'bird':
          obstacle = {
            type: 'bird',
            x: 800,
            y: 250,
            width: 30,
            height: 20,
            speed: this.gameSpeed
          };
          break;
        case 'group-cactus':
          obstacle = {
            type: 'group-cactus',
            x: 800,
            y: 300,
            width: 40,
            height: 50,
            speed: this.gameSpeed
          };
          break;
        default:
          obstacle = {
            type: 'cactus',
            x: 800,
            y: 300,
            width: 20,
            height: 50,
            speed: this.gameSpeed
          };
      }
      
      this._obstacles.push(obstacle);
      this.obstacles.set(this._obstacles);
      this.lastObstacleTime = now;
    }
  }

  private updateObstacles(): void {
    this._obstacles = this._obstacles
      .map(obstacle => ({
        ...obstacle,
        x: obstacle.x - obstacle.speed
      }))
      .filter(obstacle => obstacle.x > -50);
    
    this.obstacles.set(this._obstacles);
  }

  private checkCollisions(): void {
    const dino = this._dino();
    
    for (const obstacle of this._obstacles) {
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + dino.width > obstacle.x &&
        dino.y < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
      ) {
        this._status.set('game-over');
        this._highScore.set(Math.max(this._highScore(), this._score()));
        return;
      }
    }
  }
}