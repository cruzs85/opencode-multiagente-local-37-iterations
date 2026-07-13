import { Injectable, inject, signal, computed } from '@angular/core';
import { GameState, DinoState, Cactus, INITIAL_SPEED, GRAVITY, JUMP_FORCE, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT, CACTUS_MIN_INTERVAL, CACTUS_MAX_INTERVAL, SPEED_INCREMENT, SPEED_INTERVAL, MAX_SPEED } from '../models/game.types';
import { HighScoreService } from './high-score.service';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly highScoreService = inject(HighScoreService);
  private readonly _gameState = signal<GameState>(this.createInitialState());
  private lastCactusSpawn = 0;
  private lastSpeedIncrease = 0;
  private animationFrameId: number | null = null;
  private lastTimestamp = 0;

  readonly gameState = this._gameState.asReadonly();
  readonly highScore = this.highScoreService.highScore;
  readonly isRunning = computed(() => this._gameState().isRunning);
  readonly isGameOver = computed(() => this._gameState().isGameOver);
  readonly score = computed(() => this._gameState().score);
  readonly speed = computed(() => this._gameState().speed);
  readonly dino = computed(() => this._gameState().dino);
  readonly cactuses = computed(() => this._gameState().cactuses);

  private createInitialState(): GameState {
    const currentHighScore = this.highScoreService.highScore();
    return {
      dino: {
        x: 80,
        y: GROUND_Y - 44,
        width: 40,
        height: 44,
        velocityY: 0,
        isJumping: false,
        jumpCount: 0,
        isDucking: false
      },
      cactuses: [],
      score: 0,
      highScore: currentHighScore,
      speed: INITIAL_SPEED,
      isRunning: false,
      isGameOver: false,
      isStarted: false
    };
  }

  startGame(): void {
    if (this._gameState().isRunning) {
      return;
    }

    this._gameState.set(this.createInitialState());
    this._gameState.update(state => ({
      ...state,
      isStarted: true,
      isRunning: true
    }));

    this.animationFrameId = requestAnimationFrame(timestamp => this.gameLoop(timestamp));
  }

  resetGame(): void {
    this.cancelGameLoop();
    this._gameState.set(this.createInitialState());
  }

  jump(): void {
    const state = this._gameState();
    
    // Si el juego no está corriendo, iniciarlo
    if (!state.isRunning) {
      this.startGame();
      return;
    }
    
    // Si está game over, reiniciar (esto ya lo maneja startGame)
    if (state.isGameOver) {
      this.startGame();
      return;
    }

    this._gameState.update(state => {
      const dino = state.dino;
      if (!dino.isJumping || dino.jumpCount === 1) {
        return {
          ...state,
          dino: {
            ...dino,
            velocityY: JUMP_FORCE,
            isJumping: true,
            jumpCount: dino.jumpCount + 1
          }
        };
      }
      return state;
    });
  }

  private gameLoop(timestamp: number): void {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      this.animationFrameId = requestAnimationFrame(ts => this.gameLoop(ts));
      return;
    }

    let deltaTime = (timestamp - this.lastTimestamp) / 1000; // convertir a segundos
    this.lastTimestamp = timestamp;

    // Limitar deltaTime para evitar saltos si la pestaña estaba en segundo plano
    if (deltaTime > 0.1) {
      deltaTime = 0.1;
    }

    this._gameState.update(state => {
      const newState = { ...state, dino: { ...state.dino }, cactuses: [...state.cactuses] };
      this.updateDino(deltaTime, newState);
      this.updateCactuses(deltaTime, newState);
      this.spawnCactus(newState);
      this.increaseSpeed(timestamp, newState);
      newState.score += deltaTime * 10;
      this.checkCollision(newState);
      return newState;
    });

    if (!this._gameState().isGameOver) {
      this.animationFrameId = requestAnimationFrame(ts => this.gameLoop(ts));
    } else {
      this.cancelGameLoop();
    }
  }



  private updateDino(deltaTime: number, state: GameState): void {
    const dino = state.dino;
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY * deltaTime * 60;

    if (dino.y >= GROUND_Y - dino.height) {
      dino.y = GROUND_Y - dino.height;
      dino.velocityY = 0;
      dino.isJumping = false;
      dino.jumpCount = 0;
    }
  }

  private updateCactuses(deltaTime: number, state: GameState): void {
    state.cactuses = state.cactuses.map(cactus => ({
      ...cactus,
      x: cactus.x - state.speed * deltaTime * 60
    })).filter(cactus => cactus.x > -50);
  }

  private spawnCactus(state: GameState): void {
    const now = Date.now();
    const timeSinceLastSpawn = now - this.lastCactusSpawn;
    
    if (timeSinceLastSpawn < CACTUS_MIN_INTERVAL) {
      return;
    }
    
    // Probabilidad aumenta con el tiempo desde el último spawn
    const probability = Math.min(1, (timeSinceLastSpawn - CACTUS_MIN_INTERVAL) / (CACTUS_MAX_INTERVAL - CACTUS_MIN_INTERVAL));
    
    if (Math.random() < probability) {
      const cactusType = Math.random() < 0.5 ? 'small' : 'large';
      const height = cactusType === 'small' ? 30 + Math.random() * 10 : 45 + Math.random() * 15;
      const width = cactusType === 'small' ? 20 + Math.random() * 5 : 25 + Math.random() * 10;

      state.cactuses.push({
        x: CANVAS_WIDTH,
        y: GROUND_Y - height,
        width,
        height,
        type: cactusType
      });

      this.lastCactusSpawn = now;
    }
  }

  private checkCollision(state: GameState): boolean {
    const dino = state.dino;
    for (const cactus of state.cactuses) {
      const dinoLeft = dino.x;
      const dinoRight = dino.x + dino.width;
      const dinoTop = dino.y;
      const dinoBottom = dino.y + dino.height;

      const cactusLeft = cactus.x;
      const cactusRight = cactus.x + cactus.width;
      const cactusTop = cactus.y;
      const cactusBottom = cactus.y + cactus.height;

      const hitboxMargin = 5;
      const dinoHitboxLeft = dinoLeft + hitboxMargin;
      const dinoHitboxRight = dinoRight - hitboxMargin;
      const dinoHitboxTop = dinoTop + hitboxMargin;
      const dinoHitboxBottom = dinoBottom - hitboxMargin;

      const cactusHitboxLeft = cactusLeft + hitboxMargin;
      const cactusHitboxRight = cactusRight - hitboxMargin;
      const cactusHitboxTop = cactusTop + hitboxMargin;
      const cactusHitboxBottom = cactusBottom - hitboxMargin;

      if (dinoHitboxRight > cactusHitboxLeft &&
          dinoHitboxLeft < cactusHitboxRight &&
          dinoHitboxBottom > cactusHitboxTop &&
          dinoHitboxTop < cactusHitboxBottom) {
        state.isRunning = false;
        state.isGameOver = true;
        if (state.score > this.highScoreService.highScore()) {
          this.highScoreService.updateIfHigher(state.score);
        }
        return true;
      }
    }
    return false;
  }

  private increaseSpeed(timestamp: number, state: GameState): void {
    if (timestamp - this.lastSpeedIncrease >= SPEED_INTERVAL && state.speed < MAX_SPEED) {
      state.speed += SPEED_INCREMENT;
      this.lastSpeedIncrease = timestamp;
    }
  }

  cancelGameLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}
