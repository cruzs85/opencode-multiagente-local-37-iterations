export type GamePhase = 'welcome' | 'playing' | 'game-over';

export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  jumpCount: number;
  legFrame: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus-small' | 'cactus-large' | 'bird';
}

export interface GameData {
  speed: number;
  score: number;
  highScore: number;
  distance: number;
}

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 300,
  GROUND_Y: 250,
  GRAVITY: 0.6,
  JUMP_VELOCITY: -12,
  BASE_SPEED: 6,
  MAX_SPEED: 16,
  SPEED_INCREMENT: 0.001,
  DINO_X: 80,
  DINO_WIDTH: 40,
  DINO_HEIGHT: 44,
  OBSTACLE_MIN_GAP: 100,
  OBSTACLE_MAX_GAP: 200,
  INITIAL_OBSTACLE_DELAY: 1000,
  DOUBLE_JUMP_VELOCITY: -10,
} as const;