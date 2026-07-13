import { Injectable, inject, effect, DestroyRef, Injector } from '@angular/core';
import { signal } from '@angular/core';
import { HighScoreService } from './high-score.service';

export type GameState = 'welcome' | 'playing' | 'gameover';
export type DinoState = {
  y: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
  frame: number;
};
export type Obstacle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'air';
};
export type Cloud = {
  id: string;
  x: number;
  y: number;
  width: number;
  opacity: number;
};

@Injectable({ providedIn: 'root' })
export class GameService {
  // Inyectar HighScoreService con inject()
  private readonly highScoreService = inject(HighScoreService);
  // Inyectar Injector con inject() (para el effect)
  private readonly injector = inject(Injector);
  // Inyectar DestroyRef con inject()
  private readonly destroyRef = inject(DestroyRef);

  // === SIGNALS PRIVADOS ===
  private readonly _state = signal<GameState>('welcome');
  private readonly _score = signal<number>(0);
  private readonly _dino = signal<DinoState>({ y: 0, velocityY: 0, isJumping: false, jumpCount: 0, frame: 0 });
  private readonly _obstacles = signal<Obstacle[]>([]);
  private readonly _velocity = signal<number>(6);
  private readonly _distance = signal<number>(0);
  private readonly _groundOffset = signal<number>(0);
  private readonly _highScoreValue = signal<number>(0);
  private readonly _clouds = signal<Cloud[]>([]);

  // === SIGNALS PÚBLICOS ===
  readonly state = this._state.asReadonly();
  readonly score = this._score.asReadonly();
  readonly dino = this._dino.asReadonly();
  readonly obstacles = this._obstacles.asReadonly();
  readonly velocity = this._velocity.asReadonly();
  readonly distance = this._distance.asReadonly();
  readonly groundOffset = this._groundOffset.asReadonly();
  readonly highScore = this._highScoreValue.asReadonly();
  readonly clouds = this._clouds.asReadonly();

  // === CONSTANTES ===
  private readonly GRAVITY = 0.6;
  private readonly JUMP_FORCE = -12;
  private readonly GROUND_Y = 220; // posición Y del suelo en el canvas
  private readonly DINO_X = 50; // posición X fija del dinosaurio
  private readonly DINO_WIDTH = 56;
  private readonly DINO_HEIGHT = 70;
  private readonly MIN_OBSTACLE_INTERVAL = 35; // frames mínimo entre obstáculos
  private readonly MAX_VELOCITY = 16;
  private readonly VELOCITY_INCREMENT = 0.001; // incremento por frame

  // === VARIABLES DE INSTANCIA (no signals) ===
  private animationFrameId: number | null = null;
  private frameCount = 0;
  private obstacleCooldown = 0;

  // === MÉTODOS PÚBLICOS ===

  // startGame(): reinicia todas las signals a valores iniciales, carga highScore, pone estado 'playing', inicia el game loop
  startGame(): void {
    this._state.set('playing');
    this._score.set(0);
    this._dino.set({ y: this.GROUND_Y - this.DINO_HEIGHT, velocityY: 0, isJumping: false, jumpCount: 0, frame: 0 });
    this._obstacles.set([]);
    this._velocity.set(6);
    this._distance.set(0);
    this._groundOffset.set(0);
    this._clouds.set([]);
    this._highScoreValue.set(this.highScoreService.highScore());
    this.startLoop();
  }

  // jump(): si jumpCount < 2, aplica JUMP_FORCE a velocityY, incrementa jumpCount, pone isJumping = true
  jump(): void {
    this._dino.update(d => {
      if (d.jumpCount < 2) {
        return {
          ...d,
          y: d.y - 1,
          velocityY: this.JUMP_FORCE,
          jumpCount: d.jumpCount + 1,
          isJumping: true
        };
      }
      return d;
    });
  }

  // gameOver(): pone estado 'gameover', guarda highScore, detiene el game loop
  gameOver(): void {
    this._state.set('gameover');
    this.highScoreService.saveHighScore(this._score());
    this.stopLoop();
  }

  // resetToWelcome(): pone estado 'welcome', reinicia todo
  resetToWelcome(): void {
    this._state.set('welcome');
    this.stopLoop();
  }

  // === MÉTODOS PRIVADOS ===

  // startLoop(): inicia requestAnimationFrame, llama a gameLoop()
  private startLoop(): void {
    this.gameLoop();
  }

  // stopLoop(): cancela requestAnimationFrame si existe
  private stopLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // gameLoop(): el bucle principal. Incrementa frameCount. Llama a update(), render() (NOTA: como esto es un servicio, el render se hará desde el componente. El game loop solo debe actualizar el estado)
  // Implementación: this.animationFrameId = requestAnimationFrame(() => this.gameLoop()); this.update();
  private gameLoop(): void {
    this.update();
    if (this._state() === 'playing') {
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
  }

  // update(): 
  //   1. Actualiza velocidad: _velocity.update(v => Math.min(v + VELOCITY_INCREMENT, MAX_VELOCITY))
  //   2. Actualiza distancia: _distance.update(d => d + this._velocity() * 0.1)
  //   3. Actualiza score: _score.set(Math.floor(this._distance()))
  //   4. Actualiza groundOffset: _groundOffset.update(o => (o + this._velocity()) % 20)
  //   5. Aplica física al dino: 
  //      - Si está en el aire (y < GROUND_Y), aplica gravedad a velocityY, actualiza y
  //      - Si y >= GROUND_Y, pone y = GROUND_Y, velocityY = 0, isJumping = false, jumpCount = 0
  //   6. Actualiza frame de animación cada 10 frames: _dino.update(d => ({...d, frame: (d.frame + 1) % 2}))
  //   7. Genera obstáculos: obstacleCooldown-- si > 0; si cooldown <= 0, genera aleatoriamente (30% probabilidad) un nuevo obstáculo con x = canvasWidth (800), width aleatorio 20-30, height aleatorio 35-50
  //      El cooldown se resetea a un valor entre MIN_OBSTACLE_INTERVAL y MIN_OBSTACLE_INTERVAL * 2
  //   8. Mueve obstáculos: _obstacles.update(obs => obs.map(o => ({...o, x: o.x - this._velocity()})).filter(o => o.x > -50))
  //   9. Detecta colisiones: para cada obstáculo, verificar si hay solapamiento con el rectángulo del dino (DINO_X, dino.y, DINO_WIDTH, DINO_HEIGHT)
  //      Si hay colisión, llama a gameOver()
  private update(): void {
    // 1. Actualiza velocidad
    this._velocity.update(v => Math.min(v + this.VELOCITY_INCREMENT, this.MAX_VELOCITY));
    
    // 2. Actualiza distancia
    this._distance.update(d => d + this._velocity() * 0.1);
    
    // 3. Actualiza score
    this._score.set(Math.floor(this._distance()));
    
    // 4. Actualiza groundOffset
    this._groundOffset.update(o => (o + this._velocity()) % 20);
    
    // 5. Aplica física al dino
    this._dino.update(d => {
      let newY = d.y;
      let newVelocityY = d.velocityY;
      let isJumping = d.isJumping;
      let jumpCount = d.jumpCount;
      
      if (d.y + this.DINO_HEIGHT <= this.GROUND_Y) {
        // Aplica gravedad
        newVelocityY += this.GRAVITY;
        newY += newVelocityY;
      } else {
        // En el suelo
        newY = this.GROUND_Y - this.DINO_HEIGHT;
        newVelocityY = 0;
        isJumping = false;
        jumpCount = 0;
      }
      
      return {
        ...d,
        y: newY,
        velocityY: newVelocityY,
        isJumping,
        jumpCount
      };
    });
    
    // 6. Actualiza frame de animación cada 10 frames
    this._dino.update(d => {
      if (this.frameCount % 10 === 0) {
        return {
          ...d,
          frame: (d.frame + 1) % 2
        };
      }
      return d;
    });
    
    // 6b. Mover nubes (parallax: más lento que obstáculos)
    this._clouds.update(clouds => 
      clouds
        .map(c => ({ ...c, x: c.x - this._velocity() * 0.3 }))
        .filter(c => c.x + c.width > -50)
    );
    
    // 6c. Generar nubes cada ~200 frames
    if (this.frameCount % 200 === 0) {
      const newCloud: Cloud = {
        id: Math.random().toString(36).substring(2, 9),
        x: 800,
        y: Math.floor(Math.random() * 101) + 20, // 20-120
        width: Math.floor(Math.random() * 41) + 40, // 40-80
        opacity: Math.random() * 0.4 + 0.3, // 0.3-0.7
      };
      this._clouds.update(clouds => [...clouds, newCloud]);
    }
    
    // 7. Genera obstáculos
    this.obstacleCooldown--;
    if (this.obstacleCooldown <= 0) {
      // 60% probabilidad de generar un obstáculo
      if (Math.random() < 0.6) {
        const isAir = Math.random() < 0.4; // 40% de ser aéreo
        let width: number, height: number, y: number;
        
        if (isAir) {
          // Obstáculo aéreo (pájaro)
          width = Math.floor(Math.random() * 11) + 30; // 30-40
          height = Math.floor(Math.random() * 6) + 20; // 20-25
          y = Math.floor(Math.random() * 41) + 80; // 80-120
        } else {
          // Obstáculo terrestre (cactus)
          width = Math.floor(Math.random() * 11) + 20; // 20-30
          height = Math.floor(Math.random() * 16) + 35; // 35-50
          y = this.GROUND_Y - height;
        }
        
        // Verificar que no haya solapamiento horizontal con obstáculos de distinto tipo
        const newX = 800;
        const existingObstacles = this._obstacles();
        const hasOverlap = existingObstacles.some(o => 
          o.type !== (isAir ? 'air' : 'ground') && // Solo verificar contra el tipo opuesto
          Math.abs(o.x - newX) < 200 // Margen de 200px
        );
        
        if (!hasOverlap) {
          const newObstacle: Obstacle = {
            id: Math.random().toString(36),
            x: newX,
            y,
            width,
            height,
            type: isAir ? 'air' : 'ground'
          };
          this._obstacles.update(obs => [...obs, newObstacle]);
        }
      }
      // Reset cooldown
      this.obstacleCooldown = Math.floor(Math.random() * this.MIN_OBSTACLE_INTERVAL) + this.MIN_OBSTACLE_INTERVAL;
    }
    
    // 8. Mueve obstáculos
    this._obstacles.update(obs => {
      const updatedObstacles = obs.map(o => ({ ...o, x: o.x - this._velocity() }));
      return updatedObstacles.filter(o => o.x > -50);
    });
    
    // 9. Detecta colisiones
    const dino = this._dino();
    for (const obstacle of this._obstacles()) {
      if (this.checkCollision(obstacle)) {
        this.gameOver();
        return;
      }
    }
    
    this.frameCount++;
  }

  // checkCollision(obstacle: Obstacle): boolean — verifica colisión entre rectángulo del dino y el obstáculo
  private checkCollision(obstacle: Obstacle): boolean {
    const dino = this._dino();
    return (
      this.DINO_X < obstacle.x + obstacle.width &&
      this.DINO_X + this.DINO_WIDTH > obstacle.x &&
      dino.y <= obstacle.y + obstacle.height &&
      dino.y + this.DINO_HEIGHT > obstacle.y
    );
  }

  // === CONSTRUCTOR ===
  // Cargar highScore del HighScoreService al crear
  // Usar effect() con injector para observar cambios de highScore y propagarlos
  constructor() {
    this._highScoreValue.set(this.highScoreService.highScore());
    // Efecto para sincronizar highScore
    effect(() => {
      const highScore = this.highScoreService.highScore();
      this._highScoreValue.set(highScore);
    }, { injector: this.injector });
  }
}
