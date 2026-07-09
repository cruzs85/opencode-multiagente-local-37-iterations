export type ObstacleType = 'cactus' | 'bird';

export interface Dinosaur {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  jumpCount: number;
  isJumping: boolean;
  isRunning: boolean;
}

export interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface GameState {
  dinosaur: Dinosaur;
  obstacles: Obstacle[];
  score: number;
  highScore: number;
  gameSpeed: number;
  isGameOver: boolean;
  isRunning: boolean;
  isStarted: boolean;
  groundOffset: number;
}

export const GROUND_Y = 350;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const INITIAL_SPEED = 5;
export const MAX_SPEED = 16;
export const SPEED_INCREMENT = 0.001;
export const OBSTACLE_MIN_GAP = 300;
export const DINO_START_X = 80;