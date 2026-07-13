export type GameScreen = 'welcome' | 'game' | 'gameOver';

export type GameState = 'idle' | 'running' | 'paused' | 'gameOver';

export interface Dino {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  jumpCount: number;
  isGrounded: boolean;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  passed: boolean;
}

export const GameConfig = {
  GRAVITY: 1600,
  JUMP_VELOCITY: -550,
  GROUND_Y: 340,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  INITIAL_SPEED: 280,
  SPEED_INCREMENT: 8,
  OBSTACLE_MIN_INTERVAL: 1.5,
  OBSTACLE_MAX_INTERVAL: 3.0,
  DINO_WIDTH: 40,
  DINO_HEIGHT: 50
};