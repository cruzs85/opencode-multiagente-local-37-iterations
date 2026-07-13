import { Component, ElementRef, ViewChild, inject, effect, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private gameService = inject(GameService);
  private highScoreService = inject(HighScoreService);
  private router = inject(Router);
  
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private boundKeyDown = this.handleKeyDown.bind(this);
  
  score = this.gameService.score;
  gameOver = this.gameService.isGameOver;
  isPlaying = this.gameService.isPlaying;
  speed = this.gameService.speed;
  obstacles = this.gameService.obstacles;
  
  // Exponer para template
  dinoY = this.gameService.dinoY;
  jumpCount = this.gameService.jumpCount;
  obstacleCount = this.gameService.obstacleCount;  // signal directa
  
  constructor() {
    // Efecto para detectar game over y navegar
    effect(() => {
      if (this.gameService.isGameOver()) {
        this.highScoreService.saveScore(this.gameService.score());
        this.stopLoop();
        setTimeout(() => {
          this.router.navigate(['/game-over']);
        }, 500);
      }
    });
  }
  
  ngAfterViewInit() {
    const canvas = this.gameCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    window.addEventListener('keydown', this.boundKeyDown);
    
    this.gameService.startGame();
    this.startRenderLoop();
  }
  
  ngOnDestroy() {
    window.removeEventListener('keydown', this.boundKeyDown);
    this.stopLoop();
    this.gameService.reset();
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }
  
  private startRenderLoop() {
    const loop = () => {
      if (!this.gameService.isPlaying()) return;
      
      this.gameService.update();
      this.render();
      
      this.animationFrameId = requestAnimationFrame(loop);
    };
    
    this.animationFrameId = requestAnimationFrame(loop);
  }
  
  private stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }
  
  private render() {
    const canvas = this.gameCanvas.nativeElement;
    const ctx = this.ctx;
    const dino = this.gameService.getDinoState();
    const obs = this.gameService.obstacles();
    const groundY = this.gameService.getGroundY();
    
    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground line (corrige la posición)
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);  // Corregido: sin + 20
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();
    
    // Dino (usar dimensiones correctas del servicio)
    ctx.fillStyle = '#0f0';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);  // Corregido: usar dino.width y dino.height
    
    // Obstacles
    ctx.fillStyle = '#f00';
    for (const obstacle of obs) {
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
    
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier New';
    ctx.fillText(`Score: ${this.gameService.score()}`, 10, 30);
    ctx.fillText(`Speed: ${this.gameService.speed().toFixed(1)}`, 10, 55);
  }
}