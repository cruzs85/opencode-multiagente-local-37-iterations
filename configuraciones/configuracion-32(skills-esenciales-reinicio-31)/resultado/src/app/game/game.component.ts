import { Component, ElementRef, ViewChild, inject, effect, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  gameService = inject(GameService);
  router = inject(Router);
  ngZone = inject(NgZone);
  
  ctx!: CanvasRenderingContext2D;
  animationFrameId = 0;
  
  private boundKeyDown = this.handleKeyDown.bind(this);
  private boundClick = this.handleClick.bind(this);
  
  private navigateOnGameOver = effect(() => {
    if (this.gameService.gameOver()) {
      this.router.navigate(['/game-over']);
    }
  });

  ngAfterViewInit(): void {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.gameService.startGame();
    this.gameLoop();
    
    // Añadir event listeners
    window.addEventListener('keydown', this.boundKeyDown);
    this.gameCanvas.nativeElement.addEventListener('click', this.boundClick);
    window.addEventListener('touchstart', this.boundClick);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationFrameId);
    this.gameService.stopGame();
    
    // Remover event listeners
    window.removeEventListener('keydown', this.boundKeyDown);
    this.gameCanvas.nativeElement.removeEventListener('click', this.boundClick);
    window.removeEventListener('touchstart', this.boundClick);
  }

  gameLoop(): void {
    this.gameService.update(1);
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  draw(): void {
    const canvas = this.gameCanvas.nativeElement;
    const ctx = this.ctx;
    
    // Limpiar canvas
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar línea del suelo
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 15;
    ctx.fillRect(0, 200, canvas.width, 5);
    ctx.shadowBlur = 0;
    
    // Dibujar dinosaurio
    const dinoX = 50;
    const dinoYPosition = 200 - 40 + this.gameService.dinoY();
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 15;
    ctx.fillRect(dinoX, dinoYPosition, 40, 40);
    ctx.shadowBlur = 0;
    
    // Dibujar obstáculos
    for (const obstacle of this.gameService.obstacles()) {
      ctx.fillStyle = '#ff1744';
      ctx.shadowColor = '#ff1744';
      ctx.shadowBlur = 15;
      ctx.fillRect(obstacle.x, 200 - obstacle.height, obstacle.width, obstacle.height);
      ctx.shadowBlur = 0;
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }

  handleClick(): void {
    this.gameService.jump();
  }
}