export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
  isDucking: boolean;
}

export interface Cactus {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'small' | 'large';
}

export interface GameState {
  dino: DinoState;
  cactuses: Cactus[];
  score: number;
  highScore: number;
  speed: number;
  isRunning: boolean;
  isGameOver: boolean;
  isStarted: boolean;
}

export type GameStatus = 'idle' | 'running' | 'gameOver';

export const INITIAL_SPEED = 6;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const GROUND_Y = 300;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 350;
export const CACTUS_MIN_INTERVAL = 1000;
export const CACTUS_MAX_INTERVAL = 3000;
export const SPEED_INCREMENT = 0.5;
export const SPEED_INTERVAL = 5000;
export const MAX_SPEED = 20;
export const HIGH_SCORE_KEY = 'dino-runner-high-score';