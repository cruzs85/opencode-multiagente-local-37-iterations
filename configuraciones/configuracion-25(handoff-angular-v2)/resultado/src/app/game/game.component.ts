import { Component, ElementRef, ViewChild, inject, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../core/services/game.service';
import { ScoreService } from '../core/services/score.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  gameService = inject(GameService);
  scoreService = inject(ScoreService);
  destroyRef = inject(DestroyRef);
  router = inject(Router);

  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  animationFrameId: number = 0;
  lastTime: number = 0;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    // Initialize canvas
    canvas.width = 800;
    canvas.height = 400;
    
    // Start game loop
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    
    // Keyboard event listener
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        this.gameService.jump();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
    });
    
    this.gameService.startGame();
  }

  gameLoop(timestamp: number) {
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.gameService.gameLoop(deltaTime);
    this.render();
    
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  render() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#555';
    ctx.fillRect(0, 380, canvas.width, 20);
    
    // Draw dinosaur
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(100, this.gameService.dinoY(), 40, 50);
    
    // Draw dinosaur eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(120, this.gameService.dinoY() + 10, 5, 5);
    
    // Draw obstacles
    this.gameService.obstacles().forEach(obstacle => {
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
  }

  restartGame() {
    this.gameService.resetGame();
    this.gameService.startGame();
    this.lastTime = 0;
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  goToMenu() {
    cancelAnimationFrame(this.animationFrameId);
    this.gameService.resetGame();
    this.router.navigate(['/welcome']);
  }
}
