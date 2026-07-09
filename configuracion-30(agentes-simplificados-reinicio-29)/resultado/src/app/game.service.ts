import { Injectable, inject } from '@angular/core';
import { signal, effect } from '@angular/core';
import { GameState, GameScreen, Obstacle, initialState } from './game.state';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly GRAVITY = -1.2;
  private readonly JUMP_FORCE = 26;
  private readonly SECOND_JUMP_FORCE = 20;
  private readonly GROUND_HEIGHT = 50;
  private readonly DINO_WIDTH = 80;
  private readonly DINO_HEIGHT = 120;
  private readonly OBSTACLE_WIDTH = 30;
  private readonly OBSTACLE_HEIGHT = 50;
  private readonly MIN_OBSTACLE_INTERVAL = 2000; // ms
  private readonly MAX_OBSTACLE_INTERVAL = 4000; // ms
  private readonly SPEED_INCREMENT = 0.008;

  private animationFrameId: number | null = null;
  private lastTimestamp: number | null = null;
  private nextObstacleInterval: number = 0;

  state = signal<GameState>(initialState);
  highScore = signal<number>(this.loadHighScore());

  constructor() {
    // Configurar efecto para actualizar high score en localStorage
    effect(() => {
      const score = this.highScore();
      this.saveHighScore(score);
    });
  }

  startGame(): void {
    const currentState = this.state();
    this.state.set({
      ...currentState,
      screen: 'playing',
      score: 0,
      speed: 5,
      dinoY: 0,
      dinoVelocityY: 0,
      isJumping: false,
      jumpCount: 0,
      obstacles: [],
      isRunning: true,
      lastObstacleTime: 0,
      gameTime: 0
    });
    this.lastTimestamp = null;
    this.nextObstacleInterval = this.calculateRandomInterval();
    this.startLoop();
  }

  jump(): void {
    const currentState = this.state();
    
    // Solo permitir saltar si el dino está en el suelo o ya ha saltado una vez
    if (!currentState.isJumping || currentState.jumpCount < 2) {
      const newVelocityY = currentState.jumpCount === 0 
        ? this.JUMP_FORCE 
        : this.SECOND_JUMP_FORCE;
      
      this.state.update(state => ({
        ...state,
        dinoVelocityY: newVelocityY,
        isJumping: true,
        jumpCount: state.jumpCount + 1
      }));
    }
  }

  updateGame(deltaTime: number): void {
    if (!this.state().isRunning) return;

    const currentState = this.state();
    
    // Capar deltaTime para evitar valores extremos cuando el tab pierde foco
    const cappedDeltaTime = Math.min(deltaTime, 50);
    
    const newTime = currentState.gameTime + cappedDeltaTime;
    const newSpeed = currentState.speed + this.SPEED_INCREMENT * (cappedDeltaTime / 16);
    
    // Actualizar posición del dino (gravedad) - frame-rate independent
    const timeScale = cappedDeltaTime / 16; // escala relativa a 60fps
    let newDinoY = currentState.dinoY + currentState.dinoVelocityY * timeScale;
    let newVelocityY = currentState.dinoVelocityY + this.GRAVITY * timeScale;
    let isJumping = currentState.isJumping;
    let jumpCount = currentState.jumpCount;
    
    // Verificar si el dino está en el suelo
    if (newDinoY <= 0) {
      newDinoY = 0;
      newVelocityY = 0;
      isJumping = false;
      jumpCount = 0;
    }
    
    // Generar obstáculos
    let newObstacles = [...currentState.obstacles];
    let lastObstacleTime = currentState.lastObstacleTime;
    
    if (newTime - lastObstacleTime > this.nextObstacleInterval) {
      newObstacles.push({
        id: Date.now(),
        x: window.innerWidth,
        y: 50,
        width: this.OBSTACLE_WIDTH,
        height: this.OBSTACLE_HEIGHT + Math.floor(Math.random() * 51) + 50, // 100-150 (100%-200% más alto)
        type: 'cactus'
      });
      lastObstacleTime = newTime;
      this.nextObstacleInterval = this.calculateRandomInterval();
    }
    
    // Mover obstáculos
    newObstacles = newObstacles
      .map(obstacle => ({
        ...obstacle,
        x: obstacle.x - newSpeed
      }))
      // Eliminar obstáculos fuera de la pantalla
      .filter(obstacle => obstacle.x + obstacle.width > 0);
    
    // Calcular puntuación
    const newScore = Math.floor(newTime / 100);
    
    // Actualizar estado
    this.state.update(state => ({
      ...state,
      gameTime: newTime,
      speed: newSpeed,
      dinoY: newDinoY,
      dinoVelocityY: newVelocityY,
      isJumping: isJumping,
      jumpCount: jumpCount,
      obstacles: newObstacles,
      lastObstacleTime: lastObstacleTime,
      score: newScore
    }));
    
    // Detectar colisiones
    this.checkCollisions();
  }

  private checkCollisions(): void {
    const currentState = this.state();
    
    if (currentState.obstacles.length === 0) return;
    
    const dinoRect = {
      x: 100, // Posición fija del dino
      y: 50 + currentState.dinoY,
      width: this.DINO_WIDTH,
      height: this.DINO_HEIGHT
    };
    
    for (const obstacle of currentState.obstacles) {
      const obstacleRect = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };
      
      // Colisión AABB (Axis-Aligned Bounding Box)
      if (
        dinoRect.x < obstacleRect.x + obstacleRect.width &&
        dinoRect.x + dinoRect.width > obstacleRect.x &&
        dinoRect.y < obstacleRect.y + obstacleRect.height &&
        dinoRect.y + dinoRect.height > obstacleRect.y
      ) {
        this.gameOver();
        return;
      }
    }
  }

  gameOver(): void {
    const currentState = this.state();
    this.stopLoop();
    
    // Actualizar high score
    const newHighScore = Math.max(currentState.highScore, currentState.score);
    this.highScore.set(newHighScore);
    
    // Actualizar estado del juego
    this.state.update(state => ({
      ...state,
      screen: 'gameover',
      isRunning: false
    }));
    
    // Guardar en localStorage después de actualizar
    this.saveHighScore(newHighScore);
  }

  resetGame(): void {
    this.stopLoop();
    this.state.set({
      ...initialState,
      highScore: this.highScore()
    });
  }

  private startLoop(): void {
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
      }
      
      const deltaTime = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      
      this.updateGame(deltaTime);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.lastTimestamp = null;
  }

  private calculateRandomInterval(): number {
    const currentSpeed = this.state().speed;
    const baseInterval = Math.random() * (this.MAX_OBSTACLE_INTERVAL - this.MIN_OBSTACLE_INTERVAL) + this.MIN_OBSTACLE_INTERVAL;
    // El intervalo disminuye proporcionalmente a la velocidad (base speed = 5)
    const speedFactor = 5 / currentSpeed;
    return Math.max(600, baseInterval * speedFactor);
  }

  private loadHighScore(): number {
    try {
      const highScore = localStorage.getItem('dino-high-score');
      return highScore ? parseInt(highScore, 10) : 0;
    } catch {
      return 0;
    }
  }

  private saveHighScore(score: number): void {
    try {
      localStorage.setItem('dino-high-score', score.toString());
    } catch {
      // Ignore errors in localStorage
    }
  }
}