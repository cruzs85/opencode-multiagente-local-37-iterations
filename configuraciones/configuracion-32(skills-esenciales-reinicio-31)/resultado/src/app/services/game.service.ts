import { Injectable, signal } from '@angular/core';
import { HighScoreService } from './high-score.service';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private highScoreService: HighScoreService) {}

  // Estados con signals
  score = signal(0);
  speed = signal(5); // pixeles por frame base
  gameOver = signal(false);
  isPlaying = signal(false);
  dinoY = signal(0); // posición Y del dinosaurio, 0 = suelo
  dinoVelY = signal(0); // velocidad vertical
  jumpCount = signal(0); // 0 = en suelo, 1 = primer salto, 2 = doble salto usado
  obstacles = signal<Array<{x: number, y: number, width: number, height: number}>>([]);
  
  // High score del servicio - usando getter para prevenir inicialización temprana
  get highScore() {
    return this.highScoreService.highScore;
  }

  // Constantes
  GRAVITY = 0.6;
  JUMP_FORCE = -12;
  GROUND_Y = 150; // coordenada del suelo en el canvas
  DINO_WIDTH = 40;
  DINO_HEIGHT = 40;
  MAX_OBSTACLES = 5;

  startGame(): void {
    this.score.set(0);
    this.speed.set(5);
    this.gameOver.set(false);
    this.isPlaying.set(true);
    this.obstacles.set([]);
    this.dinoY.set(0);
    this.dinoVelY.set(0);
    this.jumpCount.set(0);
  }

  stopGame(): void {
    this.isPlaying.set(false);
  }

  jump(): void {
    if (this.jumpCount() < 2) {
      this.dinoVelY.set(this.dinoVelY() + this.JUMP_FORCE);
      this.jumpCount.update(count => count + 1);
    }
  }

  update(frameDelta: number): void {
    if (!this.isPlaying() || this.gameOver()) {
      return;
    }

    // Actualizar física del dino
    this.dinoVelY.update(velY => velY + this.GRAVITY);
    this.dinoY.update(y => y + this.dinoVelY());

    // Si el dino toca el suelo
    if (this.dinoY() >= 0) {
      this.dinoY.set(0);
      this.dinoVelY.set(0);
      this.jumpCount.set(0);
    }

    // Mover obstáculos a la izquierda
    this.obstacles.update(obstacles => {
      return obstacles.map(obs => ({ ...obs, x: obs.x - this.speed() }));
    });

    // Eliminar obstáculos que salen de pantalla
    this.obstacles.update(obstacles => {
      return obstacles.filter(obs => obs.x > -obs.width);
    });

    // Generar nuevos obstáculos aleatoriamente
    if (Math.random() < 0.02 * (this.speed() / 5)) { // Probabilidad basada en velocidad
      // Asegurar espacio mínimo entre obstáculos
      const lastObstacle = this.obstacles()[this.obstacles().length - 1];
      if (!lastObstacle || lastObstacle.x < 300) {
        const width = Math.floor(Math.random() * 21) + 20; // 20-40 de ancho
        const height = Math.floor(Math.random() * 31) + 20; // 20-50 de alto
        this.obstacles.update(obstacles => [
          ...obstacles,
          { x: 800, y: this.GROUND_Y - height, width, height }
        ]);
      }
    }

    // Detectar colisiones
    const dinoX = 50;
    const dinoYPosition = this.GROUND_Y - this.DINO_HEIGHT + this.dinoY();

    for (const obs of this.obstacles()) {
      if (this.checkCollision({ x: dinoX, y: dinoYPosition, width: this.DINO_WIDTH, height: this.DINO_HEIGHT }, obs)) {
        this.gameOver.set(true);
        this.isPlaying.set(false);
        
        // Actualizar high score si es necesario
        if (this.score() > this.highScoreService.highScore()) {
          this.highScoreService.setHighScore(this.score());
          this.highScoreService.highScore.set(this.score());
        }
        return;
      }
    }

    // Incrementar score
    this.score.update(score => score + 1);

    // Aumentar velocidad cada 500 puntos
    if (this.score() % 500 === 0 && this.score() > 0) {
      this.speed.update(speed => speed + 0.5);
    }
  }

  private checkCollision(rect1: { x: number, y: number, width: number, height: number }, rect2: { x: number, y: number, width: number, height: number }): boolean {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
}