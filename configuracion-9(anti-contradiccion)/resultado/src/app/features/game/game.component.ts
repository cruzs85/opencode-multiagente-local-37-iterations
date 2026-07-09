import { Component, inject, ViewChild, ElementRef, afterNextRender, OnDestroy } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private gameService = inject(GameService);
  private scoreService = inject(ScoreService);
  
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private lastTime = 0;
  private gameContainer!: HTMLElement;
  private boundKeydownHandler: (event: KeyboardEvent) => void = (event) => {
    if (event.code === 'Space' && this.gameService.status() === 'playing') {
      event.preventDefault();
      this.gameService.jump();
    }
  };
  
  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      this.initEventListeners();
      this.gameLoop();
    });
  }
  
  private initCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  private initEventListeners(): void {
    window.addEventListener('keydown', this.boundKeydownHandler);
  }
  
  private gameLoop(timestamp: number = 0): void {
    const deltaTime = Math.min(33, timestamp - this.lastTime);
    this.lastTime = timestamp;
    
    if (this.gameService.status() === 'playing') {
      this.gameService.update(deltaTime);
      this.draw();
    } else if (this.gameService.status() === 'game-over') {
      this.draw();
    } else if (this.gameService.status() === 'welcome') {
      this.draw();
    }
    
    this.animationFrameId = requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }
  
  private draw(): void {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar cielo
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dibujar suelo
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(0, 350, this.canvas.width, 50);
    
    // Dibujar línea del suelo
    this.ctx.fillStyle = '#00FF00';
    this.ctx.fillRect(0, 350, this.canvas.width, 2);
    
    if (this.gameService.status() === 'playing' || this.gameService.status() === 'game-over') {
      // Dibujar dinosaurio
      const dino = this.gameService.dino();
      this.ctx.fillStyle = '#535E2D';
      this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
      
      // Dibujar ojo del dinosaurio
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(dino.x + 30, dino.y + 15, 5, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Dibujar patas del dinosaurio
      this.ctx.fillStyle = '#535E2D';
      this.ctx.fillRect(dino.x + 5, dino.y + 40, 8, 10); // pata delantera
      this.ctx.fillRect(dino.x + 27, dino.y + 40, 8, 10); // pata trasera
      
      // Dibujar obstáculos
      const obstacles = this.gameService.obstacles();
      obstacles.forEach(obstacle => {
        this.ctx.fillStyle = '#008000';
        switch (obstacle.type) {
          case 'cactus':
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Detalles del cactus
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 3, 15);
            this.ctx.fillRect(obstacle.x + 12, obstacle.y + 10, 3, 10);
            break;
          case 'small-cactus':
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Detalles del cactus pequeño
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(obstacle.x + 3, obstacle.y + 5, 2, 10);
            break;
          case 'bird':
            this.ctx.fillStyle = '#8B0000';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Dibujar ala del pájaro
            this.ctx.fillStyle = '#A52A2A';
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x + 20, obstacle.y + 5);
            this.ctx.lineTo(obstacle.x + 30, obstacle.y);
            this.ctx.lineTo(obstacle.x + 30, obstacle.y + 10);
            this.ctx.closePath();
            this.ctx.fill();
            break;
          case 'group-cactus':
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Detalles del grupo de cactus
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 3, 15);
            this.ctx.fillRect(obstacle.x + 15, obstacle.y + 10, 3, 10);
            this.ctx.fillRect(obstacle.x + 25, obstacle.y + 5, 3, 15);
            break;
        }
      });
    }
    
    // Dibujar puntaje
    this.ctx.fillStyle = '#000000';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.gameService.score()}`, 700, 30);
    
    // Dibujar high score
    this.ctx.fillText(`HI ${this.gameService.highScore()}`, 700, 55);
  }
  
  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.boundKeydownHandler);
  }
}
