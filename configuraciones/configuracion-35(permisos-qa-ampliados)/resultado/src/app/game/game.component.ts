import { Component, ViewChild, AfterViewInit, OnDestroy, HostListener, ChangeDetectionStrategy, effect, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private animationFrameId: number | null = null;

  constructor(
    private gameService: GameService,
    private router: Router
  ) {
    effect(() => {
      if (this.gameService.gameStateSignal() === 'gameOver') {
        this.router.navigate(['/game-over']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.gameService.start();
    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private render(): void {
    const canvasElement = this.gameCanvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw ground line
    ctx.fillStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 350);
    ctx.lineTo(canvasElement.width, 350);
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(50, this.gameService.dinoYSignal(), 30, 40);

    // Draw obstacles
    ctx.fillStyle = '#ff3366';
    this.gameService.obstaclesSignal().forEach(obstacle => {
      ctx.fillRect(obstacle.x, 350 - obstacle.height, obstacle.width, obstacle.height);
    });

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${this.gameService.scoreSignal()}`, canvasElement.width - 10, 30);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}