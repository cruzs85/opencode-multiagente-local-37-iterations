import { Injectable, signal, inject } from '@angular/core';
import { ScoreService } from './score.service';

export type GamePhase = 'welcome' | 'playing' | 'gameover';

export interface Obstacle {
  x: number;        // posición X en el canvas
  width: number;    // ancho del obstáculo
  height: number;   // alto del obstáculo
  type: 'cactus' | 'bird';
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly scoreService = inject(ScoreService);
  
  // Constantes de física
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly INITIAL_SPEED = 6;
  private readonly MAX_SPEED = 16;
  private readonly SPEED_INCREMENT = 0.001;
  private readonly OBSTACLE_MIN_GAP = 1000;
  private readonly DINO_WIDTH = 36;
  private readonly DINO_HEIGHT = 40;
  private readonly GROUND_HEIGHT = 250;
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 300;
  
  // Signals públicas
  readonly gamePhase = signal<GamePhase>('welcome');
  readonly score = signal<number>(0);
  readonly highScore = this.scoreService.highScore;
  readonly speed = signal<number>(this.INITIAL_SPEED);
  readonly dinoY = signal<number>(0);
  readonly dinoFrame = signal<number>(0);
  readonly obstacles = signal<Obstacle[]>([]);
  readonly groundOffset = signal<number>(0);
  
  // Estado interno privado
  private velocity = 0;
  private jumpCount = 0;
  private lastObstacleTime = 0;
  private elapsedTime = 0;
  private scoreValue = 0;
  private currentSpeed = this.INITIAL_SPEED;
  private frameTimer = 0;
  
  startGame(): void {
    this.currentSpeed = this.INITIAL_SPEED;
    this.scoreValue = 0;
    this.elapsedTime = 0;
    this.obstacles.set([]);
    this.dinoY.set(0);
    this.velocity = 0;
    this.jumpCount = 0;
    this.gamePhase.set('playing');
  }
  
  jump(): void {
    if (this.gamePhase() !== 'playing') {
      return;
    }
    
    // Si está en el suelo, permitir salto normal
    if (this.dinoY() >= 0) {
      this.jumpCount = 0;
    }
    
    // Máximo 2 saltos consecutivos
    if (this.jumpCount < 2) {
      this.velocity = this.JUMP_FORCE;
      this.jumpCount++;
    }
  }
  
  update(deltaTime: number): void {
    if (this.gamePhase() !== 'playing') {
      return;
    }
    
    this.elapsedTime += deltaTime;
    this.updateSpeed(deltaTime);
    this.updateDino(deltaTime);
    this.updateObstacles(deltaTime);
    this.updateScore(deltaTime);
    this.checkCollisions();
    this.advanceGround(deltaTime);
  }
  
  resetGame(): void {
    this.gamePhase.set('welcome');
    this.obstacles.set([]);
    this.dinoY.set(0);
    this.velocity = 0;
    this.jumpCount = 0;
    this.lastObstacleTime = 0;
    this.elapsedTime = 0;
    this.scoreValue = 0;
    this.currentSpeed = this.INITIAL_SPEED;
  }
  
  private updateSpeed(deltaTime: number): void {
    this.currentSpeed = Math.min(this.currentSpeed + this.SPEED_INCREMENT * deltaTime, this.MAX_SPEED);
    this.speed.set(this.currentSpeed);
  }
  
  private updateDino(deltaTime: number): void {
    // Aplicar gravedad
    this.velocity += this.GRAVITY * (deltaTime / 16);
    this.dinoY.update(y => y + this.velocity);
    
    // Si el dino aterrizó
    if (this.dinoY() >= 0) {
      this.dinoY.set(0);
      this.velocity = 0;
      this.jumpCount = 0;
    }
    
    // Actualizar frame de animación (cambia cada ~100ms)
    this.frameTimer += deltaTime;
    if (this.frameTimer >= 100) {
      this.frameTimer = 0;
      this.dinoFrame.update(frame => (frame + 1) % 3);
    }
  }
  
  private updateObstacles(deltaTime: number): void {
    // Mover obstáculos existentes
    const updatedObstacles = this.obstacles().map(obstacle => ({
      ...obstacle,
      x: obstacle.x - this.currentSpeed * (deltaTime / 16)
    })).filter(obstacle => obstacle.x + obstacle.width > 0);
    
    // Generar nuevo obstáculo si es momento
    if (this.elapsedTime - this.lastObstacleTime > this.OBSTACLE_MIN_GAP / this.currentSpeed * 6) {
      const newObstacle: Obstacle = {
        x: this.CANVAS_WIDTH,
        width: Math.floor(Math.random() * 11) + 20, // 20-30
        height: Math.floor(Math.random() * 16) + 35, // 35-50
        type: Math.random() > 0.5 ? 'cactus' : 'bird'
      };
      updatedObstacles.push(newObstacle);
      this.lastObstacleTime = this.elapsedTime;
    }
    
    this.obstacles.set(updatedObstacles);
  }
  
  private updateScore(deltaTime: number): void {
    this.scoreValue += deltaTime * 0.01;
    this.score.set(Math.floor(this.scoreValue));
  }
  
  private checkCollisions(): void {
    const dinoX = 50;
    const dinoY = this.GROUND_HEIGHT - this.DINO_HEIGHT + this.dinoY();
    const dinoRect = {
      x: dinoX,
      y: dinoY,
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT
    };
    
    for (const obstacle of this.obstacles()) {
      const obstacleRect = {
        x: obstacle.x,
        y: this.GROUND_HEIGHT - obstacle.height,
        width: obstacle.width,
        height: obstacle.height
      };
      
      // Verificar colisión
      if (
        dinoRect.x < obstacleRect.x + obstacleRect.width &&
        dinoRect.x + dinoRect.width > obstacleRect.x &&
        dinoRect.y < obstacleRect.y + obstacleRect.height &&
        dinoRect.y + dinoRect.height > obstacleRect.y
      ) {
        this.gamePhase.set('gameover');
        this.scoreService.saveHighScore(this.scoreValue);
        return;
      }
    }
  }
  
  private advanceGround(deltaTime: number): void {
    this.groundOffset.update(offset => {
      const newOffset = offset - this.currentSpeed * (deltaTime / 16);
      // Resetear para efecto de bucle
      return newOffset <= -40 ? 0 : newOffset;
    });
  }
}