import { Component, signal, computed, HostListener, effect, OnDestroy, ElementRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Prueba de @code-writer - Fecha: 12/05/2026
 * Este comentario fue agregado como prueba de funcionamiento
 */

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {
  protected readonly gameWidth = signal(1200);
  protected readonly gameHeight = signal(250);
  protected readonly dinosaurY = signal(50);
  protected readonly dinosaurVelocity = signal(0);
  protected readonly isJumping = signal(false);
  private readonly _jumpCount = signal(2);
  protected readonly jumpCount = this._jumpCount.asReadonly();
  protected readonly obstacles = signal<Obstacle[]>([]);
  protected readonly score = signal(0);
  protected readonly highScore = signal(0);
  protected readonly isGameOver = signal(false);
  protected readonly isPlaying = signal(false);
  protected readonly containerWidth = signal(1200);
  protected readonly scaleFactor = computed(() => this.containerWidth() / 1200);
protected readonly dinosaurDebug = computed(() => {
  const dinoX = this.containerWidth() * 0.05;
  return `X: ${dinoX.toFixed(1)} Y: ${this.dinosaurY().toFixed(1)} V: ${this.dinosaurVelocity().toFixed(1)}`;
});

// Dimensiones escalables del dinosaurio
protected readonly dinoWidth = computed(() => this.containerWidth() * 0.033);
protected readonly dinoHeight = computed(() => this.containerWidth() * 0.042);

// Dimensiones escalables de la cabeza del dinosaurio
protected readonly dinoHeadWidth = computed(() => this.dinoWidth() * 0.6);
protected readonly dinoHeadHeight = computed(() => this.dinoHeight() * 0.4);

// Dimensiones escalables de la cola del dinosaurio
protected readonly dinoTailWidth = computed(() => this.dinoWidth() * 0.3);
protected readonly dinoTailHeight = computed(() => this.dinoHeight() * 0.3);

// Grosor del suelo escalable
protected readonly groundHeight = computed(() => this.containerWidth() * 0.008);

// Física de salto escalable
private readonly gravity = computed(() => -0.5 * this.scaleFactor());
private readonly jumpStrength = computed(() => 12 * this.scaleFactor());

// Límites para generación de obstáculos (escalables)
private readonly obstacleMinHeightRatio = 0.025;
private readonly obstacleMaxHeightRatio = 0.042; // Máximo 80% de la altura del dino (0.042 * 0.8 ≈ 0.0336)
protected readonly obstacleMinHeight = computed(() => this.containerWidth() * this.obstacleMinHeightRatio);
protected readonly obstacleMaxHeight = computed(() => this.containerWidth() * this.obstacleMaxHeightRatio);

  
  private readonly groundY = 0;
  private readonly gameSpeed = signal(5);
  private gameLoop: number | null = null;
  private elementRef = inject(ElementRef);

  constructor() {
    const savedHighScore = localStorage.getItem('dino-high-score');
    if (savedHighScore) {
      this.highScore.set(parseInt(savedHighScore, 10));
    }

    // Inicializar tamaño del contenedor después de que el DOM esté listo
    afterNextRender(() => {
      this.detectContainerSize();
    });
  }

  private detectContainerSize(): void {
    const container = this.elementRef.nativeElement.querySelector('.game-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      this.containerWidth.set(rect.width);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.detectContainerSize();
  }

  ngOnDestroy() {
    this.stopGame();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      if (!this.isPlaying()) {
        this.startGame();
      } else if (this._jumpCount() > 0) {
        this.jump();
      }
    }
  }

  startGame() {
    this.isPlaying.set(true);
    this.isGameOver.set(false);
    this.score.set(0);
    this._jumpCount.set(2);
    this.dinosaurY.set(this.groundY);
    this.dinosaurVelocity.set(0);
    this.obstacles.set([]);
    this.gameLoop = window.setInterval(() => this.update(), 20);
  }

  private jump() {
    if (this._jumpCount() > 0) {
      this.dinosaurVelocity.set(this.jumpStrength());
      this.isJumping.set(true);
      this._jumpCount.update(count => count - 1);
    }
  }

  private update() {
    this.updateDinosaur();
    this.updateObstacles();
    this.updateScore();
    this.checkCollisions();
  }

  private updateDinosaur() {
    const newVelocity = this.dinosaurVelocity() + this.gravity();
    this.dinosaurVelocity.set(newVelocity);

    const newY = this.dinosaurY() + newVelocity;

    if (newY <= this.groundY && newVelocity < 0) {
      this.dinosaurY.set(this.groundY);
      this.dinosaurVelocity.set(0);
      this.isJumping.set(false);
      this._jumpCount.set(2);
    } else {
      this.dinosaurY.set(newY);
    }
    
    console.log('Dino Debug:', this.dinosaurDebug());
  }

  private updateObstacles() {
    const currentObstacles = this.obstacles().map(obs => ({
      ...obs,
      x: obs.x - this.gameSpeed()
    })).filter(obs => obs.x + obs.width > 0);

    if (currentObstacles.length === 0 || 
        this.containerWidth() - (currentObstacles[currentObstacles.length - 1].x + currentObstacles[currentObstacles.length - 1].width) > 250 + Math.random() * 200) {
      currentObstacles.push({
        x: this.containerWidth(),
        width: this.containerWidth() * (0.02 + Math.random() * 0.017),
        height: this.obstacleMinHeight() + Math.random() * (this.obstacleMaxHeight() - this.obstacleMinHeight())
      });
    }

    this.obstacles.set(currentObstacles);
  }

  private updateScore() {
    this.score.update(s => s + 1);
    if (this.score() % 500 === 0) {
      this.gameSpeed.update(s => s + 0.5);
    }
  }

private checkCollisions() {
  const dinoX = this.containerWidth() * 0.05;
  const dinoWidth = this.containerWidth() * 0.033;
  const dinoHeight = this.containerWidth() * 0.042;
  const dinoBottom = this.dinosaurY();
  const dinoTop = dinoBottom + dinoHeight;

  for (const obs of this.obstacles()) {
    const obsWidth = obs.width;
    const obsHeight = obs.height;
    const obsBottom = 0; // Los obstáculos están en el suelo (bottom=0)
    const obsTop = obsHeight;

    // Colisión AABB (Axis-Aligned Bounding Box)
    if (dinoX < obs.x + obsWidth &&
        dinoX + dinoWidth > obs.x &&
        dinoBottom < obsTop &&
        dinoTop > obsBottom) {
      this.gameOver();
      break;
    }
  }
}

  private gameOver() {
    this.isGameOver.set(true);
    this.isPlaying.set(false);
    this.stopGame();

    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      localStorage.setItem('dino-high-score', this.score().toString());
    }
  }

  private stopGame() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }
}