import { Component, ElementRef, viewChild, afterNextRender, HostListener, inject } from '@angular/core';
import { GameEngineService } from '../../core/services/game-engine.service';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.html',
  styleUrls: ['./game-board.scss'],
  standalone: true
})
export class GameBoardComponent {
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('gameCanvas');
  gameEngine = inject(GameEngineService);
  scoreService = inject(ScoreService);

  private _ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    afterNextRender(() => {
      const canvas = this.canvasRef()?.nativeElement;
      if (canvas) {
        canvas.width = 800;
        canvas.height = 250;
        this._ctx = canvas.getContext('2d');
        if (this._ctx) {
          this._renderLoop();
        }
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
      this.gameEngine.jump();
    }
  }

  @HostListener('click')
  handleClick(): void {
    this.gameEngine.jump();
  }

  private _renderLoop(): void {
    if (this.gameEngine.gameState() === 'playing' && this._ctx) {
      // Limpiar canvas
      this._ctx.clearRect(0, 0, 800, 250);

      // Dibujar suelo
      this._ctx.beginPath();
      this._ctx.moveTo(0, 200);
      this._ctx.lineTo(800, 200);
      this._ctx.strokeStyle = '#535353';
      this._ctx.lineWidth = 2;
      this._ctx.stroke();

      // Dibujar dinosaurio
      const dinoY = 200 + this.gameEngine.dinoY();
      const dinoFrame = this.gameEngine.dinoFrame();
      
      this._ctx.fillStyle = '#5c5c5c';
      
      // Cuerpo del dinosaurio
      this._ctx.fillRect(100, dinoY, 44, 48);
      
      // Detalle de pata según frame
      if (dinoFrame === 0) {
        // Pata abajo
        this._ctx.fillRect(100, dinoY + 48, 10, 8);
      } else {
        // Pata arriba
        this._ctx.fillRect(100, dinoY + 48, 8, 10);
      }

      // Dibujar obstáculos
      for (const obstacle of this.gameEngine.obstacles()) {
        this._ctx.fillStyle = '#2d5a27';
        if (obstacle.type === 'cactus-small') {
          this._ctx.fillRect(obstacle.x, 200 - 35, 20, 35);
        } else {
          this._ctx.fillRect(obstacle.x, 200 - 50, 30, 50);
        }
      }

      // Dibujar puntaje
      this._ctx.font = '16px monospace';
      this._ctx.fillStyle = '#757575';
      this._ctx.fillText(`Score: ${this.gameEngine.score()}`, 700, 20);

      // Dibujar récord
      if (this.scoreService.highScore() > 0) {
        this._ctx.fillText(`HI ${this.scoreService.highScore()}`, 700, 40);
      }

      // Continuar el bucle
      requestAnimationFrame(() => this._renderLoop());
    } else if (this.gameEngine.gameState() === 'game-over' && this._ctx) {
      // Dibujar mensaje de game over
      this._ctx.clearRect(0, 0, 800, 250);
      
      // Dibujar suelo
      this._ctx.beginPath();
      this._ctx.moveTo(0, 200);
      this._ctx.lineTo(800, 200);
      this._ctx.strokeStyle = '#535353';
      this._ctx.lineWidth = 2;
      this._ctx.stroke();
      
      // Dibujar dinosaurio
      const dinoY = 200 + this.gameEngine.dinoY();
      const dinoFrame = this.gameEngine.dinoFrame();
      
      this._ctx.fillStyle = '#5c5c5c';
      
      // Cuerpo del dinosaurio
      this._ctx.fillRect(100, dinoY, 44, 48);
      
      // Detalle de pata según frame
      if (dinoFrame === 0) {
        // Pata abajo
        this._ctx.fillRect(100, dinoY + 48, 10, 8);
      } else {
        // Pata arriba
        this._ctx.fillRect(100, dinoY + 48, 8, 10);
      }

      // Dibujar obstáculos
      for (const obstacle of this.gameEngine.obstacles()) {
        this._ctx.fillStyle = '#2d5a27';
        if (obstacle.type === 'cactus-small') {
          this._ctx.fillRect(obstacle.x, 200 - 35, 20, 35);
        } else {
          this._ctx.fillRect(obstacle.x, 200 - 50, 30, 50);
        }
      }

      // Dibujar puntaje
      this._ctx.font = '16px monospace';
      this._ctx.fillStyle = '#757575';
      this._ctx.fillText(`Score: ${this.gameEngine.score()}`, 700, 20);

      // Dibujar récord
      if (this.scoreService.highScore() > 0) {
        this._ctx.fillText(`HI ${this.scoreService.highScore()}`, 700, 40);
      }

      // Dibujar mensaje de game over
      this._ctx.font = '32px monospace';
      this._ctx.fillStyle = '#ff4757';
      this._ctx.textAlign = 'center';
      this._ctx.fillText('GAME OVER', 400, 100);
      
      this._ctx.font = '16px monospace';
      this._ctx.fillStyle = '#ffffff';
      this._ctx.fillText('Press SPACE to restart', 400, 140);
      this._ctx.textAlign = 'left';
    }
  }
}
