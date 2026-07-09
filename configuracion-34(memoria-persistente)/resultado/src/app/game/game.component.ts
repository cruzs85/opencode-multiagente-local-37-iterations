import { Component, ElementRef, inject, OnDestroy, AfterViewInit, ViewChild, effect, computed, signal } from '@angular/core';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnDestroy, AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private gameService = inject(GameService);
  private highScoreService = inject(HighScoreService);
  private router = inject(Router);
  
  // Exponer servicios para usar en template
  protected gameServicePublic = this.gameService;
  protected highScoreServicePublic = {
    highScore: () => this.highScoreService.getHighScore()
  };
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  
  private animationFrameId!: number;
  private gameLoopId!: number;
  
  private dino = {
    x: 50,
    y: 0,
    width: 40,
    height: 60,
    velocityY: 0,
    isJumping: false,
    jumpCount: 0,
    maxJumps: 2
  };
  
  private obstacles: { x: number; y: number; width: number; height: number; type: string }[] = [];
  private keys: { [key: string]: boolean } = {};
  
  private groundY = 0;
  private gameSpeed = 5;
  private gravity = 0.8;
  private jumpForce = -15;
  
  private boundKeyDown = this.handleKeyDown.bind(this);
  private boundKeyUp = this.handleKeyUp.bind(this);
  private boundCanvasClick = this.handleCanvasClick.bind(this);
  
  // Propiedades computadas para E2E testing
  protected gameState = computed(() => {
    return this.gameService.isGameOver() ? 'gameover' : 'playing';
  });
  
  protected jumpCount = signal(0);
  
  protected obstacleCount = signal(0);
  
  protected dinoY = signal(0);
  
  constructor() {
    // Effect para iniciar el juego cuando el score cambie
    effect(() => {
      this.gameService.score();
    });
  }
  
  ngAfterViewInit(): void {
    this.initCanvas();
    this.startGame();
  }
  
  private initCanvas(): void {
    this.canvas = this.gameCanvas.nativeElement;
    // Ajustar el tamaño del canvas al contenedor o usar tamaño fijo
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext('2d')!;
    this.groundY = this.canvas.height - 30;
    this.dino.y = this.groundY - this.dino.height;
  }
  
  private startGame(): void {
    this.gameLoop();
    this.addEventListeners();
  }
  
  private gameLoop(): void {
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
  
  private update(): void {
    // Actualizar dinosaurio
    this.updateDino();
    
    // Generar obstáculos
    this.generateObstacles();
    
    // Actualizar obstáculos
    this.updateObstacles();
    
    // Aumentar velocidad
    this.increaseSpeed();
    
    // Verificar colisiones
    this.checkCollisions();
    
    // Incrementar puntuación
    this.gameService.incrementScore();
    
    // Actualizar signals para E2E testing
    this.jumpCount.set(this.dino.jumpCount);
    this.obstacleCount.set(this.obstacles.length);
    this.dinoY.set(Math.round(this.dino.y));
  }
  
  private updateDino(): void {
    // Gravedad
    this.dino.velocityY += this.gravity;
    this.dino.y += this.dino.velocityY;
    
    // Verificar si está en el suelo
    if (this.dino.y >= this.groundY - this.dino.height) {
      this.dino.y = this.groundY - this.dino.height;
      this.dino.velocityY = 0;
      this.dino.isJumping = false;
      this.dino.jumpCount = 0;
    }
  }
  
  private generateObstacles(): void {
    // Generar obstáculos aleatoriamente
    if (Math.random() < 0.02) {
      const obstacleTypes = ['cactus-small', 'cactus-large', 'bird'];
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
      
      let height, width, y;
      if (type === 'cactus-small') {
        width = 20;
        height = 40;
        y = this.groundY - height;
      } else if (type === 'cactus-large') {
        width = 30;
        height = 60;
        y = this.groundY - height;
      } else {
        width = 40;
        height = 30;
        y = this.groundY - 100; // Pájaro en altura
      }
      
      this.obstacles.push({
        x: this.canvas.width,
        y: y,
        width: width,
        height: height,
        type: type
      });
    }
  }
  
  private updateObstacles(): void {
    // Mover obstáculos hacia la izquierda y eliminar los que salen de pantalla
    this.obstacles.forEach((obstacle, index) => {
      obstacle.x -= Math.round(this.gameSpeed);
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(index, 1);
      }
    });
  }
  
  private increaseSpeed(): void {
    // Aumentar velocidad cada ciertos frames
    if (this.gameService.score() % 500 === 0 && this.gameService.score() > 0) {
      this.gameSpeed += 0.5;
    }
  }
  
  private checkCollisions(): void {
    // Caja de colisión del dinosaurio
    const dinoRect = {
      x: this.dino.x,
      y: this.dino.y,
      width: this.dino.width,
      height: this.dino.height
    };
    
    for (const obstacle of this.obstacles) {
      const obstacleRect = {
        x: obstacle.x,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height
      };
      
      if (this.checkCollision(dinoRect, obstacleRect)) {
        // Colisión detectada
        this.gameService.gameOver();
        this.highScoreService.saveScore(this.gameService.score());
        this.router.navigate(['/game-over']);
        this.cleanup();
        return;
      }
    }
  }
  
  private checkCollision(rect1: { x: number; y: number; width: number; height: number }, 
                        rect2: { x: number; y: number; width: number; height: number }): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
  
  private draw(): void {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar fondo
    this.ctx.fillStyle = '#07070b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar suelo
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
    
    // Dibujar dinosaurio
    this.ctx.fillStyle = '#39ff14';
    this.ctx.fillRect(Math.round(this.dino.x), Math.round(this.dino.y), this.dino.width, this.dino.height);
    
    // Dibujar cuello y cabeza
    this.ctx.fillRect(Math.round(this.dino.x + 30), Math.round(this.dino.y - 10), 10, 20);
    
    // Dibujar ojos
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(Math.round(this.dino.x + 35), Math.round(this.dino.y + 10), 5, 5);
    
    // Dibujar obstáculos
    this.obstacles.forEach(obstacle => {
      if (obstacle.type === 'bird') {
        // Dibujar pájaro
        this.ctx.fillStyle = '#ff1744';
        this.ctx.fillRect(Math.round(obstacle.x), Math.round(obstacle.y), obstacle.width, obstacle.height);
        // Dibujar alas
        this.ctx.fillRect(Math.round(obstacle.x + 5), Math.round(obstacle.y - 10), 20, 10);
      } else {
        // Dibujar cactus
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.fillRect(Math.round(obstacle.x), Math.round(obstacle.y), obstacle.width, obstacle.height);
        // Dibujar cactus con pico
        this.ctx.fillRect(Math.round(obstacle.x + 5), Math.round(obstacle.y - 10), 10, 10);
      }
    });
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    this.keys[event.key] = true;
    
    if ((event.key === ' ' || event.key === 'ArrowUp') && this.dino.jumpCount < this.dino.maxJumps) {
      this.jump();
    }
  }
  
  private handleKeyUp(event: KeyboardEvent): void {
    this.keys[event.key] = false;
  }
  
  private handleCanvasClick(): void {
    if (this.dino.jumpCount < this.dino.maxJumps) {
      this.jump();
    }
  }
  
  private jump(): void {
    if (this.dino.jumpCount < this.dino.maxJumps) {
      this.dino.velocityY = this.jumpForce;
      this.dino.isJumping = true;
      this.dino.jumpCount++;
    }
  }
  
  private addEventListeners(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    this.canvas.addEventListener('click', this.boundCanvasClick);
  }
  
  ngOnDestroy(): void {
    this.cleanup();
  }
  
  private cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.boundCanvasClick);
    }
  }
}