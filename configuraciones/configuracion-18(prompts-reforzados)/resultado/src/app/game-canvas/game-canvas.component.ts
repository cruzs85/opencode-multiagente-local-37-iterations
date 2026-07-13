import { Component, ElementRef, ViewChild, effect, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss'
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private gameService = inject(GameService);
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId = 0;
  private keyHandler!: (e: KeyboardEvent) => void;

  score = this.gameService.score;
  highScore = this.gameService.highScore;
  isGameOver = this.gameService.isGameOver;
  isRunning = this.gameService.isRunning;
  speed = this.gameService.speed;
  floorScore = () => Math.floor(this.score());

  constructor() {
    effect(() => { const _ = this.score(); const __ = this.gameService.dino(); const ___ = this.gameService.obstacles(); const ____ = this.isGameOver(); this.draw(); });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.gameService.startGame();
    this.startDrawLoop();
    this.keyHandler = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); this.onJump(); } };
    window.addEventListener('keydown', this.keyHandler);
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement!;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }

  private startDrawLoop() { const loop = () => { this.draw(); this.animationFrameId = requestAnimationFrame(loop); }; this.animationFrameId = requestAnimationFrame(loop); }

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, w, h);
    const groundY = h - 50;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
    const sx = w / 800;
    const sy = h / 400;
    const d = this.gameService.dino();
    const dx = d.x * sx;
    const dy = d.y * sy + (h - 400 * sy) * 0.5;
    const dw = d.width * sx;
    const dh = d.height * sy;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 10;
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillRect(dx + dw * 0.6, dy - dh * 0.3, dw * 0.5, dh * 0.4);
    ctx.fillStyle = '#07070b';
    ctx.fillRect(dx + dw * 0.75, dy - dh * 0.2, dw * 0.1, dh * 0.1);
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(dx + dw * 0.2, dy + dh, dw * 0.25, dh * 0.3);
    ctx.fillRect(dx + dw * 0.6, dy + dh, dw * 0.25, dh * 0.3);
    ctx.shadowBlur = 0;
    const obstacles = this.gameService.obstacles();
    ctx.fillStyle = '#ff1744';
    ctx.shadowColor = '#ff1744';
    ctx.shadowBlur = 8;
    for (const obs of obstacles) {
      const ox = obs.x * sx;
      const oy = obs.y * sy + (h - 400 * sy) * 0.5;
      const ow = obs.width * sx;
      const oh = obs.height * sy;
      ctx.fillRect(ox, oy, ow, oh);
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffe600';
    ctx.font = 'bold 16px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SCORE: ' + Math.floor(this.score()), w - 20, 30);
    ctx.fillStyle = '#39ff14';
    ctx.textAlign = 'left';
    ctx.fillText('HI: ' + this.highScore(), 20, 30);
    ctx.fillStyle = '#a0a0b0';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SPD: ' + this.speed().toFixed(1), w - 20, 50);
  }

  onJump() { if (this.isRunning()) { this.gameService.jump(); } else if (this.isGameOver()) { this.gameService.resetGame(); } }
  onRestart() { this.gameService.resetGame(); }

  ngOnDestroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.gameService.stopGame();
    window.removeEventListener('keydown', this.keyHandler);
  }
}