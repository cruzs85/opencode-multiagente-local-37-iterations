import { Component, signal, computed, effect, Injector, inject, afterNextRender, DestroyRef } from '@angular/core';

interface Obstacle {
  id: number;
  /** Distancia desde el borde izquierdo del contenedor en píxeles */
  left: number;
  /** Alto del obstáculo en píxeles */
  height: number;
  /** Ancho del obstáculo en píxeles */
  width: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  // ─── Señales de estado del juego ────────────────────────────────
  protected readonly isPlaying = signal(false);
  protected readonly isGameOver = signal(false);
  protected readonly score = signal(0);
  protected readonly highScore = signal(
    parseInt(localStorage.getItem('dino-high-score') ?? '0', 10)
  );

  // ─── Señales de física del dinosaurio ───────────────────────────
  /** Posición Y sobre el suelo (0 = tocando el suelo) */
  protected readonly dinoY = signal(0);
  /** Velocidad vertical (positiva = subiendo) */
  protected readonly dinoVelocity = signal(0);
  /** Saltos restantes (empieza en 2 para doble salto) */
  protected readonly jumpCount = signal(2);

  // ─── Obstáculos ─────────────────────────────────────────────────
  protected readonly obstacles = signal<Obstacle[]>([]);

  // ─── Velocidad base ─────────────────────────────────────────────
  private readonly baseSpeed = signal(3);

  // ─── Factor de escala responsive ───────────────────────────────
  protected readonly scaleFactor = signal(1);

  // ─── Referencia al contenedor del juego ─────────────────────────
  private container!: HTMLElement;
  private animationFrameId = 0;
  private frameCounter = 0;
  private obstacleIdCounter = 0;

  // ─── Información de depuración ──────────────────────────────────
  protected readonly debugInfo = computed(() => {
    const sf = this.scaleFactor();
    const xPx = this.container ? this.container.offsetWidth * 0.05 : 0;
    const yVal = this.dinoY();
    const vVal = this.dinoVelocity();
    return `X: ${(xPx / (sf || 1)).toFixed(1)}Y: ${(yVal / (sf || 1)).toFixed(1)} V: ${(vVal / (sf || 1)).toFixed(1)}`;
  });

  // ─── Velocidad del juego (aumenta cada 500 puntos) ─────────────
  protected readonly gameSpeed = computed(() => {
    return this.baseSpeed() + Math.floor(this.score() / 500) * 0.5;
  });

  // ─── Dimensiones del dinosaurio (en píxeles escalados) ─────────
  protected readonly dinoWidth = computed(() => 30 * this.scaleFactor());
  protected readonly dinoHeight = computed(() => 50 * this.scaleFactor());

  constructor() {
    afterNextRender(() => {
      this.container = document.querySelector('.game-container') as HTMLElement;
      if (!this.container) return;
      this.actualizarFactorEscala();
      document.addEventListener('keydown', this.alPresionarTecla);
      this.cicloJuego();
    });

    // Efecto para guardar high score cuando cambia
    effect(() => {
      const hs = this.highScore();
      if (hs > 0) {
        localStorage.setItem('dino-high-score', hs.toString());
      }
    }, { injector: this.injector });

    this.destroyRef.onDestroy(() => {
      document.removeEventListener('keydown', this.alPresionarTecla);
      cancelAnimationFrame(this.animationFrameId);
    });
  }

  // ─── Actualizar factor de escala según ancho del contenedor ────
  private actualizarFactorEscala(): void {
    if (this.container) {
      this.scaleFactor.set(this.container.offsetWidth / 1200);
    }
  }

  // ─── Manejador de teclado ───────────────────────────────────────
  private readonly alPresionarTecla = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (this.isGameOver()) return;
      if (!this.isPlaying()) {
        this.iniciarJuego();
        return;
      }
      this.saltar();
    }
  };

  // ─── Iniciar / Reiniciar juego ──────────────────────────────────
  protected restart(): void {
    this.iniciarJuego();
  }

  private iniciarJuego(): void {
    this.isPlaying.set(true);
    this.isGameOver.set(false);
    this.score.set(0);
    this.baseSpeed.set(3);
    this.dinoY.set(0);
    this.dinoVelocity.set(0);
    this.jumpCount.set(2);
    this.obstacles.set([]);
    this.frameCounter = 0;
    this.obstacleIdCounter = 0;
    this.actualizarFactorEscala();
  }

  // ─── Salto ──────────────────────────────────────────────────────
  private saltar(): void {
    if (this.jumpCount() > 0) {
      this.dinoVelocity.set(12 * this.scaleFactor());
      this.jumpCount.update(c => c - 1);
    }
  }

  // ─── Detección de colisión AABB ────────────────────────────────
  private hayColision(): boolean {
    const sf = this.scaleFactor();
    const anchoContenedor = this.container.offsetWidth;

    // Rectángulo del dinosaurio (coordenadas desde bottom-left)
    const dinoLeft = anchoContenedor * 0.05;
    const dinoRight = dinoLeft + this.dinoWidth();
    const dinoBottom = this.dinoY();
    const dinoTop = dinoBottom + this.dinoHeight();

    for (const obs of this.obstacles()) {
      const obsLeft = obs.left;
      const obsRight = obsLeft + obs.width;
      const obsBottom = 0;
      const obsTop = obs.height;

      // AABB: comprobar solapamiento en X y en Y
      const overlapX = dinoLeft < obsRight && dinoRight > obsLeft;
      const overlapY = dinoBottom < obsTop && dinoTop > obsBottom;
      if (overlapX && overlapY) {
        return true;
      }
    }
    return false;
  }

  // ─── Ciclo principal del juego ──────────────────────────────────
  private cicloJuego(): void {
    if (!this.isPlaying() || this.isGameOver()) {
      this.animationFrameId = requestAnimationFrame(() => this.cicloJuego());
      return;
    }

    const sf = this.scaleFactor();
    const velocidad = this.gameSpeed();

    // ── Física del dinosaurio ──
    // Gravedad: -0.5 * sf por frame
    this.dinoVelocity.update(v => v - 0.5 * sf);
    this.dinoY.update(y => {
      const nuevaY = y + this.dinoVelocity();
      if (nuevaY <= 0) {
        this.dinoVelocity.set(0);
        this.jumpCount.set(2);
        return 0;
      }
      return nuevaY;
    });

    // ── Mover obstáculos ──
    this.obstacles.update(obs => {
      return obs
        .map(o => ({ ...o, left: o.left - velocidad * sf }))
        .filter(o => o.left + o.width > 0);
    });

    // ── Generar nuevos obstáculos ──
    this.frameCounter++;
    if (this.frameCounter % 80 === 0 && Math.random() < 0.55) {
      this.obstacleIdCounter++;
      const anchoContainer = this.container.offsetWidth;
      const obsW = 18 * sf + Math.random() * 8 * sf;
      const alturaPorcentaje = 2.5 + Math.random() * 1.7; // 2.5% a 4.2%
      const obsH = (alturaPorcentaje / 100) * anchoContainer * sf;

      this.obstacles.update(obs => [...obs, {
        id: this.obstacleIdCounter,
        left: anchoContainer,
        height: obsH,
        width: obsW
      }]);
    }

    // ── Comprobar colisión ──
    if (this.hayColision()) {
      this.isGameOver.set(true);
      this.isPlaying.set(false);
      // Guardar high score
      const puntActual = this.score();
      const recordActual = this.highScore();
      if (puntActual > recordActual) {
        this.highScore.set(puntActual);
      }
      this.animationFrameId = requestAnimationFrame(() => this.cicloJuego());
      return;
    }

    // ── Incrementar puntuación ──
    this.score.update(s => s + 1);

    this.animationFrameId = requestAnimationFrame(() => this.cicloJuego());
  }
}
