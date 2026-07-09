import { Component, inject, afterNextRender, DestroyRef } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game-board',
  standalone: true,
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent {
  private gameService = inject(GameService);
  private destroyRef = inject(DestroyRef);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private lastTimestamp = 0;
  private frameCount = 0;

  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 300;
  private readonly GROUND_Y = 250;
  private readonly DINO_WIDTH = 36;
  private readonly DINO_HEIGHT = 40;
  private readonly DINO_X = 50;

  constructor() {
    afterNextRender(() => {
      this.initCanvas();
      this.initKeyboard();
      this.initResizeListener();
      this.startLoop();
    });
  }

  private initCanvas(): void {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Ajustar tamaño del canvas al viewport manteniendo proporción
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
  }

  private initKeyboard(): void {
    const handler = (event: KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'ArrowUp') {
        event.preventDefault();
        this.gameService.jump();
      }
    };

    window.addEventListener('keydown', handler);
    
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handler);
    });
  }

  private initResizeListener(): void {
    const handler = () => {
      // No necesita cambiar el tamaño lógico del canvas,
      // el CSS maneja el escalado visual automáticamente.
      // Solo forzamos un re-render para limpiar si es necesario.
    };
    
    window.addEventListener('resize', handler);
    
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', handler);
    });
  }

  private gameLoop(timestamp: number): void {
    if (this.gameService.gamePhase() === 'gameover') {
      // Detener el loop si el juego ha terminado
      this.stopLoop();
      this.render();
      return;
    }

    // Calcular deltaTime para mantener la animación consistente
    const deltaTime = this.lastTimestamp === 0 ? 16 : timestamp - this.lastTimestamp;
    // Normalizar deltaTime a máximo 33ms (para evitar saltos si el tab está en background)
    const normalizedDeltaTime = Math.min(deltaTime, 33);
    this.lastTimestamp = timestamp;

    this.gameService.update(normalizedDeltaTime);
    this.render();
    this.animationId = requestAnimationFrame(t => this.gameLoop(t));
  }

  private render(): void {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Dibujar fondo (blanco)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Dibujar suelo
    this.renderGround();
    
    // Dibujar obstáculos
    this.renderObstacles();
    
    // Dibujar dinosaurio
    this.renderDino();
    
    // Dibujar puntuación
    this.renderScore();
    
    // Dibujar game over si aplica
    if (this.gameService.gamePhase() === 'gameover') {
      this.renderGameOver();
    }
  }

  private renderDino(): void {
    const dinoY = this.gameService.dinoY();
    const dinoFrame = this.gameService.dinoFrame();
    const yPosition = this.GROUND_Y - this.DINO_HEIGHT + dinoY;
    
    // Cuerpo del dinosaurio (gris oscuro)
    this.ctx.fillStyle = '#535353';
    
    // Cuerpo principal
    this.ctx.fillRect(this.DINO_X, yPosition, this.DINO_WIDTH, this.DINO_HEIGHT);
    
    // Cabeza (sobresale arriba a la derecha)
    this.ctx.fillRect(this.DINO_X + 22, yPosition - 8, 14, 12);
    
    // Ojo
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.DINO_X + 30, yPosition - 4, 3, 3);
    
    // Brazo pequeño
    this.ctx.fillStyle = '#535353';
    this.ctx.fillRect(this.DINO_X + 15, yPosition + 12, 5, 8);
    
    // Patas con animación real
    this.ctx.fillStyle = '#535353';
    
    if (dinoY < 0) {
      // Saltando - patas recogidas
      this.ctx.fillRect(this.DINO_X + 4, yPosition + 30, 8, 8);
      this.ctx.fillRect(this.DINO_X + 24, yPosition + 30, 8, 8);
    } else if (dinoFrame % 2 === 0) {
      // Frame 0: pata izquierda adelante, derecha atrás
      this.ctx.fillRect(this.DINO_X + 4, yPosition + 32, 8, 8);
      this.ctx.fillRect(this.DINO_X + 24, yPosition + 34, 8, 6);
    } else {
      // Frame 1: pata derecha adelante, izquierda atrás
      this.ctx.fillRect(this.DINO_X + 4, yPosition + 34, 8, 6);
      this.ctx.fillRect(this.DINO_X + 24, yPosition + 32, 8, 8);
    }
  }

  private renderObstacles(): void {
    for (const obstacle of this.gameService.obstacles()) {
      this.ctx.fillStyle = '#2d8a4e'; // Verde oscuro para cactus
      
      if (obstacle.type === 'cactus') {
        // Dibujar cactus con detalles
        this.ctx.fillRect(obstacle.x, this.GROUND_Y - obstacle.height, obstacle.width, obstacle.height);
        
        // Espinas
        this.ctx.fillStyle = '#2d8a4e';
        this.ctx.fillRect(obstacle.x - 3, this.GROUND_Y - obstacle.height + 5, 3, 10);
        this.ctx.fillRect(obstacle.x + obstacle.width, this.GROUND_Y - obstacle.height + 15, 3, 10);
        this.ctx.fillRect(obstacle.x + 5, this.GROUND_Y - obstacle.height + 25, 3, 10);
      } else if (obstacle.type === 'bird') {
        // Dibujar pájaro (forma diferente)
        this.ctx.fillRect(obstacle.x, this.GROUND_Y - obstacle.height, obstacle.width, obstacle.height);
        // Alas
        this.ctx.fillRect(obstacle.x - 5, this.GROUND_Y - obstacle.height + 5, 5, 5);
        this.ctx.fillRect(obstacle.x + obstacle.width, this.GROUND_Y - obstacle.height + 5, 5, 5);
      }
    }
  }

  private renderGround(): void {
    // Línea del suelo
    this.ctx.strokeStyle = '#535353';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.GROUND_Y);
    this.ctx.lineTo(this.CANVAS_WIDTH, this.GROUND_Y);
    this.ctx.stroke();
    
    // Patrón de pequeñas marcas (guiones) que se desplazan con groundOffset
    const groundOffset = this.gameService.groundOffset();
    this.ctx.strokeStyle = '#535353';
    this.ctx.lineWidth = 1;
    
    for (let x = groundOffset % 40; x < this.CANVAS_WIDTH; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.GROUND_Y - 5);
      this.ctx.lineTo(x, this.GROUND_Y + 5);
      this.ctx.stroke();
    }
  }

  private renderScore(): void {
    const score = this.gameService.score();
    const highScore = this.gameService.highScore();
    
    this.ctx.fillStyle = '#535353';
    this.ctx.font = '18px monospace';
    this.ctx.fillText(`PUNTOS: ${score}`, this.CANVAS_WIDTH - 150, 30);
    this.ctx.fillText(`RÉCORD: ${Math.floor(highScore)}`, this.CANVAS_WIDTH - 150, 60);
  }

  private renderGameOver(): void {
    // Overlay semi-transparente
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    
    // Texto grande "GAME OVER" centrado
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 - 30);
    
    // Texto de puntuación
    const score = this.gameService.score();
    const highScore = this.gameService.highScore();
    this.ctx.font = '20px monospace';
    this.ctx.fillText(`Puntos: ${score}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 20);
    this.ctx.fillText(`Récord: ${Math.floor(highScore)}`, this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 50);
    
    // Instrucción para reiniciar
    this.ctx.font = '16px monospace';
    this.ctx.fillText('Presiona ESPACIO para reiniciar', this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2 + 90);
    
    // Listener para espacio que llama a gameService.resetGame() y luego startGame()
    const restartHandler = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        this.gameService.resetGame();
        this.gameService.startGame();
        this.startLoop();
        window.removeEventListener('keydown', restartHandler);
      }
    };
    
    window.addEventListener('keydown', restartHandler);
    
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', restartHandler);
    });
  }

  private startLoop(): void {
    this.lastTimestamp = 0;
    this.animationId = requestAnimationFrame(t => this.gameLoop(t));
  }

  private stopLoop(): void {
    cancelAnimationFrame(this.animationId);
  }
}