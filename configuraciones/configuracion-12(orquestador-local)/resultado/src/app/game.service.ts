import { Injectable, inject } from '@angular/core';
import { signal, computed, effect } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { afterNextRender } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameService {
  // Estados del juego
  private readonly _gameStarted = signal(false);
  private readonly _gameOver = signal(false);
  private readonly _score = signal(0);
  private readonly _highScore = signal(0);
  private readonly _gameSpeed = signal(5);
  private readonly _isJumping = signal(false);
  private readonly _isDoubleJumping = signal(false);
  private readonly _dinoPosition = signal({ x: 50, y: 0 });
  private readonly _gravity = signal(0.5);
  private readonly _jumpForce = signal(12);
  private readonly _isFalling = signal(false);

  // Signals públicas
  readonly gameStarted = this._gameStarted.asReadonly();
  readonly gameOver = this._gameOver.asReadonly();
  readonly score = this._score.asReadonly();
  readonly highScore = this._highScore.asReadonly();
  readonly gameSpeed = this._gameSpeed.asReadonly();
  readonly isJumping = this._isJumping.asReadonly();
  readonly isDoubleJumping = this._isDoubleJumping.asReadonly();
  readonly dinoPosition = this._dinoPosition.asReadonly();
  readonly isFalling = this._isFalling.asReadonly();

  // Derivados
  readonly speedMultiplier = computed(() => {
    return 1 + (this._score() / 1000);
  });

  // Referencias para limpieza
  private destroyRef = inject(DestroyRef);
  private gameLoopId: number | null = null;
  private keys: { [key: string]: boolean } = {};
  private lastTimestamp: number = 0;

  constructor() {
    // Inicializar eventos de teclado
    afterNextRender(() => {
      this.setupKeyboardEvents();
      this.loadHighScore();
    });

    // Efecto para manejar el estado del juego
    effect(() => {
      if (this._gameOver()) {
        this.stopGameLoop();
      }
    });
  }

  // Iniciar el juego
  startGame(): void {
    this._gameStarted.set(true);
    this._gameOver.set(false);
    this._score.set(0);
    this._gameSpeed.set(5);
    this._isJumping.set(false);
    this._isDoubleJumping.set(false);
    this._dinoPosition.set({ x: 50, y: 0 });
    this._isFalling.set(false);
    this.startGameLoop();
  }

  // Reiniciar el juego
  resetGame(): void {
    this._gameOver.set(true);
    this.stopGameLoop();
    this.saveHighScore();
  }

  // Saltar (simple o doble)
  jump(): void {
    if (!this._gameStarted() || this._gameOver()) return;

    if (!this._isJumping()) {
      // Primer salto
      this._isJumping.set(true);
      this._isDoubleJumping.set(false);
      this._dinoPosition.update(pos => ({ ...pos, y: pos.y - this._jumpForce() }));
    } else if (!this._isDoubleJumping() && this._isJumping()) {
      // Doble salto
      this._isDoubleJumping.set(true);
      this._dinoPosition.update(pos => ({ ...pos, y: pos.y - this._jumpForce() * 0.8 }));
    }
  }

  // Aumentar velocidad del juego
  increaseSpeed(): void {
    this._gameSpeed.update(speed => Math.min(speed + 0.2, 20));
  }

  // Iniciar el game loop
  private startGameLoop(): void {
    if (this.gameLoopId) return;
    
    const gameLoop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const deltaTime = timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;

      if (this._gameStarted() && !this._gameOver()) {
        this.updateGame(deltaTime);
      }

      this.gameLoopId = requestAnimationFrame(gameLoop);
    };

    this.gameLoopId = requestAnimationFrame(gameLoop);
  }

  // Detener el game loop
  private stopGameLoop(): void {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  // Actualizar el estado del juego
  private updateGame(deltaTime: number): void {
    // Actualizar puntuación
    this._score.update(score => score + 1);
    
    // Aumentar velocidad cada ciertos puntos
    if (this._score() % 500 === 0) {
      this.increaseSpeed();
    }

    // Manejar física del salto
    if (this._isJumping()) {
      this._dinoPosition.update(pos => {
        const newY = pos.y + this._gravity();
        const isGrounded = newY >= 0;
        
        if (isGrounded) {
          this._isJumping.set(false);
          this._isDoubleJumping.set(false);
          this._isFalling.set(false);
          return { ...pos, y: 0 };
        } else {
          this._isFalling.set(true);
          return { ...pos, y: newY };
        }
      });
    }

    // Actualizar puntuación alta
    if (this._score() > this._highScore()) {
      this._highScore.set(this._score());
    }
  }

  // Configurar eventos de teclado
  private setupKeyboardEvents(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.jump();
      }
      
      if (e.key === 'r' && this._gameOver()) {
        this.startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Limpiar eventos al destruir el servicio
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    });
  }

  // Guardar puntuación alta en IndexedDB
  private saveHighScore(): void {
    try {
      const request = indexedDB.open('DinoRunnerDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['highScores'], 'readwrite');
        const store = transaction.objectStore('highScores');
        
        store.put({
          id: 'highScore',
          score: this._highScore()
        });
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('highScores')) {
          const store = db.createObjectStore('highScores', { keyPath: 'id' });
          store.createIndex('score', 'score', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  }

  // Cargar puntuación alta desde IndexedDB
  private loadHighScore(): void {
    try {
      const request = indexedDB.open('DinoRunnerDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['highScores'], 'readonly');
        const store = transaction.objectStore('highScores');
        const getRequest = store.get('highScore');
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            this._highScore.set(getRequest.result.score);
          }
        };
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('highScores')) {
          const store = db.createObjectStore('highScores', { keyPath: 'id' });
          store.createIndex('score', 'score', { unique: false });
        }
      };
    } catch (error) {
      console.error('Error loading high score:', error);
    }
  }
}