import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  gameService = inject(GameService);
  highScoreService = inject(HighScoreService);
  router = inject(Router);

  // Variables privadas
  ctx!: CanvasRenderingContext2D;
  dino = { x: 50, y: 0, width: 40, height: 50, velocityY: 0, isJumping: false, jumpCount: 0 };
  obstacles: Array<{x: number, y: number, width: number, height: number}> = [];
  groundY = 150;
  canvasWidth = 800;
  canvasHeight = 200;
  animationFrameId = 0;
  obstacleTimer = 0;
  scoreTimer = 0;
  speedTimer = 0;
  boundKeyDown = this.handleKeyDown.bind(this);
  boundClick = this.handleClick.bind(this);

  ngOnInit() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.dino.y = this.groundY - this.dino.height;
    this.gameService.startGame();
    this.gameLoop();
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('click', this.boundClick);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('click', this.boundClick);
    this.gameService.stopGame();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space' || e.key === ' ') {
      this.jump();
      e.preventDefault();
    }
  }

  handleClick() {
    this.jump();
  }

  jump() {
    if (this.dino.jumpCount < 2) {
      this.dino.velocityY = -12;
      this.dino.isJumping = true;
      this.dino.jumpCount++;
    }
  }

  update() {
    // Física de salto
    this.dino.velocityY += 0.6; // Gravedad
    this.dino.y += this.dino.velocityY;

    // Verificar si el dino está en el suelo
    if (this.dino.y >= this.groundY - this.dino.height) {
      this.dino.y = this.groundY - this.dino.height;
      this.dino.velocityY = 0;
      this.dino.isJumping = false;
      this.dino.jumpCount = 0;
    }

    // Actualizar obstáculos
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].x -= this.gameService.getGameSpeed()();
      
      // Eliminar obstáculos fuera de pantalla
      if (this.obstacles[i].x + this.obstacles[i].width < 0) {
        this.obstacles.splice(i, 1);
      }
      
      // Verificar colisión
      if (this.checkCollision(this.dino, this.obstacles[i])) {
        this.gameOver();
        return;
      }
    }

    // Generar nuevos obstáculos
    this.obstacleTimer++;
    const speed = this.gameService.getGameSpeed()();
    const minObstacleGap = 300 / speed; // Ajustar separación según velocidad
    if (this.obstacleTimer > minObstacleGap) {
      const obstacleWidth = Math.floor(Math.random() * 20) + 20; // 20-40px
      const obstacleHeight = Math.floor(Math.random() * 20) + 30; // 30-50px
      this.obstacles.push({
        x: this.canvasWidth,
        y: this.groundY - obstacleHeight,
        width: obstacleWidth,
        height: obstacleHeight
      });
      this.obstacleTimer = 0;
    }

    // Actualizar puntuación
    this.scoreTimer++;
    if (this.scoreTimer >= 10) {
      this.gameService.incrementScore();
      this.scoreTimer = 0;
    }

    // Aumentar velocidad cada 600 frames (10 segundos a 60fps)
    this.speedTimer++;
    if (this.speedTimer >= 600) {
      this.gameService.increaseSpeed();
      this.speedTimer = 0;
    }
  }

  draw() {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Dibujar suelo
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.canvasWidth, this.groundY);
    this.ctx.strokeStyle = '#00f0ff';
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    // Dibujar dino
    this.ctx.fillStyle = '#39ff14';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#39ff14';
    this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);
    this.ctx.shadowBlur = 0;

    // Dibujar obstáculos
    this.ctx.fillStyle = '#ff1744';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ff1744';
    this.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    this.ctx.shadowBlur = 0;

    // Dibujar puntuación
    this.ctx.fillStyle = '#ffe600';
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Score: ${this.gameService.getScore()()}`, this.canvasWidth - 10, 30);
  }

  checkCollision(a: {x: number, y: number, width: number, height: number}, b: {x: number, y: number, width: number, height: number}): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  gameOver() {
    cancelAnimationFrame(this.animationFrameId);
    this.gameService.setGameOver();
    this.highScoreService.saveScore(this.gameService.getScore()());
    this.router.navigate(['/game-over'], { queryParams: { score: this.gameService.getScore()() } });
  }

  gameLoop() {
    if (!this.gameService.getIsPlaying()()) return;
    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}