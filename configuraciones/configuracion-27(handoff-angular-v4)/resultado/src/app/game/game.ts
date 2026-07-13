import { Component, signal, DestroyRef, afterNextRender, inject, input, output } from '@angular/core';
import { GameService } from '../services/game.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game {
  private gameService = inject(GameService);
  private storage = inject(StorageService);
  private destroyRef = inject(DestroyRef);

  readonly score = signal(0);
  readonly record = signal(0);
  readonly gameOver = output<number>();

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId!: number;
  private lastTime!: number;
  private gameSpeed = signal(5);
  private isJumping = false;
  private isDoubleJumping = false;
  private gravity = 0.5;
  private jumpForce = -12;
  private playerY = 150;
  private playerVelocity = 0;
  private obstacles: { x: number; y: number; width: number; height: number }[] = [];
  private keys: { [key: string]: boolean } = {};
  private gameRunning = false;

  constructor() {
    afterNextRender(() => {
      this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      this.ctx = this.canvas.getContext('2d')!;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      this.record.set(this.storage.getHighScore());
      
      const handleKeyDown = (event: KeyboardEvent) => {
        this.keys[event.code] = true;
        if (event.code === 'Space' || event.code === 'ArrowUp') {
          event.preventDefault();
          if (!this.isJumping) {
            this.playerVelocity = this.jumpForce;
            this.isJumping = true;
            this.isDoubleJumping = false;
          } else if (!this.isDoubleJumping && this.playerY > 0) {
            this.playerVelocity = this.jumpForce;
            this.isDoubleJumping = true;
          }
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        this.keys[event.code] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        cancelAnimationFrame(this.animationFrameId);
      });

      this.gameRunning = true;
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    });
  }

  private gameLoop() {
    if (!this.gameRunning) return;

    const now = performance.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Actualizar posición del jugador
    this.playerVelocity += this.gravity;
    this.playerY += this.playerVelocity;

    // Verificar si el jugador ha tocado el suelo
    if (this.playerY > 300) {
      this.playerY = 300;
      this.playerVelocity = 0;
      this.isJumping = false;
      this.isDoubleJumping = false;
    }

    // Mover obstáculos
    this.obstacles.forEach(obstacle => {
      obstacle.x -= this.gameSpeed();
    });

    // Eliminar obstáculos fuera de la pantalla
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -obstacle.width);

    // Generar nuevos obstáculos
    if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < 300) {
      this.obstacles.push({
        x: this.canvas.width,
        y: 300,
        width: 20,
        height: 50
      });
    }

    // Aumentar velocidad cada 100 puntos
    const newSpeed = Math.floor(this.score() / 100) + 5;
    if (newSpeed > this.gameSpeed()) {
      this.gameSpeed.set(newSpeed);
    }

    // Verificar colisiones
    const playerRect = {
      x: 50,
      y: this.playerY,
      width: 30,
      height: 50
    };

    for (const obstacle of this.obstacles) {
      if (
        playerRect.x < obstacle.x + obstacle.width &&
        playerRect.x + playerRect.width > obstacle.x &&
        playerRect.y < obstacle.y + obstacle.height &&
        playerRect.y + playerRect.height > obstacle.y
      ) {
        this.gameOver.emit(this.score());
        this.gameRunning = false;
        return;
      }
    }

    // Actualizar puntuación
    this.score.set(this.score() + 1);

    // Dibujar todo
    this.draw();

    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  private draw() {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar fondo
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar suelo
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 300, this.canvas.width, 100);

    // Dibujar jugador
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(50, this.playerY, 30, 50);

    // Dibujar obstáculos
    this.ctx.fillStyle = '#00ff00';
    this.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Dibujar puntuación
    this.ctx.fillStyle = '#ffff00';
    this.ctx.font = '20px "Press Start 2P"';
    this.ctx.fillText(`Score: ${this.score()}`, 20, 40);
    this.ctx.fillText(`Record: ${this.record()}`, 20, 70);
  }
}