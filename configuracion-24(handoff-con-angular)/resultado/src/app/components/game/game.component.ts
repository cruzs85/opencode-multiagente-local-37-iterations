import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  renderLoopId: number = 0;
  lastRenderTime: number = 0;
  private keydownHandler = (event: KeyboardEvent) => this.onKeyDown(event);

  constructor(public gameService: GameService) {}

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.renderLoopId = requestAnimationFrame((time) => this.render(time));
    window.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.renderLoopId);
    window.removeEventListener('keydown', this.keydownHandler);
  }

  private render(time: number): void {
    if (!this.lastRenderTime) {
      this.lastRenderTime = time;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawBackground();
    this.drawGround();
    const dino = this.gameService.dinoSignal();
    this.drawDino(dino);
    const obstacles = this.gameService.obstaclesSignal();
    this.drawObstacles(obstacles);
    this.drawClouds();
    this.renderLoopId = requestAnimationFrame((t) => this.render(t));
  }

  private drawBackground(): void {
    this.ctx.fillStyle = '#07070b';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawGround(): void {
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(0, 340, this.canvas.width, 2);
  }

  private drawDino(dino: any): void {
    this.ctx.fillStyle = '#39ff14';
    this.ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(dino.x + 5, dino.y + 5, 3, 3);
    this.ctx.fillRect(dino.x + 12, dino.y + 5, 3, 3);
  }

  private drawObstacles(obstacles: any[]): void {
    this.ctx.fillStyle = '#ff1744';
    obstacles.forEach(obs => {
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
  }

  private drawClouds(): void {
    this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.ctx.fillRect(100, 50, 60, 20);
    this.ctx.fillRect(120, 40, 40, 20);
    this.ctx.fillRect(400, 80, 70, 20);
    this.ctx.fillRect(420, 70, 50, 20);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if ((event.code === 'Space' || event.code === 'ArrowUp') && this.gameService.stateSignal() === 'running') {
      this.gameService.jump();
    }
    if (event.code === 'Escape') {
      if (this.gameService.stateSignal() === 'running') {
        this.gameService.pauseGame();
      } else if (this.gameService.stateSignal() === 'paused') {
        this.gameService.resumeGame();
      }
    }
  }
}