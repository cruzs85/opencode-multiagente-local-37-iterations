import { Component, ViewChild, ElementRef, afterNextRender, inject, DestroyRef, signal, output } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.html',
  styleUrl: './game.scss',
  imports: []
})
export class Game {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private gameEngine = inject(GameEngineService);
  private destroyRef = inject(DestroyRef);
  private animationFrameId = 0;
  
  score = this.gameEngine.score;
  speed = this.gameEngine.speed;
  highScore = this.gameEngine.highScore;
  
  gameOver = output<void>();
  
  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      this.startGameLoop();
    });
    
    // Manejar eventos de teclado
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        this.gameEngine.jump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Limpiar listener al destruir el componente
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(this.animationFrameId);
    });
  }
  
  private initCanvas() {
    const canvas = this.gameCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  private startGameLoop() {
    const gameLoop = () => {
      this.gameEngine.updateGame();
      
      // Dibujar en canvas
      const canvas = this.gameCanvas.nativeElement;
      const ctx = canvas.getContext('2d')!;
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar suelo
      ctx.fillStyle = '#333';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
      
      // Dibujar dinosaurio (verde fijo en X=50)
      const dinosaurY = this.gameEngine.dinosaurY();
      ctx.fillStyle = 'green';
      ctx.fillRect(50, canvas.height - 100 - dinosaurY, 30, 50);
      
      // Dibujar obstáculos
      const obstacles = this.gameEngine.obstacles();
      obstacles.forEach(obstacle => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, canvas.height - 60 - obstacle.height, obstacle.width, obstacle.height);
      });
      
      // Detectar colisiones
      if (this.gameEngine.gameState() === 'gameOver') {
        this.gameOver.emit();
        return;
      }
      
      this.animationFrameId = requestAnimationFrame(gameLoop);
    };
    
    this.animationFrameId = requestAnimationFrame(gameLoop);
  }
}
