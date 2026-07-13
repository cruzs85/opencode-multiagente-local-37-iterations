export type GameScreen = 'welcome' | 'playing' | 'gameover';

export interface GameState {
  screen: GameScreen;
  score: number;
  speed: number;
  highScore: number;
  dinoY: number;
  dinoVelocityY: number;
  isJumping: boolean;
  jumpCount: number;
  obstacles: Obstacle[];
  isRunning: boolean;
  lastObstacleTime: number;
  gameTime: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export const initialState: GameState = {
  screen: 'welcome',
  score: 0,
  speed: 5,
  highScore: 0,
  dinoY: 0,
  dinoVelocityY: 0,
  isJumping: false,
  jumpCount: 0,
  obstacles: [],
  isRunning: false,
  lastObstacleTime: 0,
  gameTime: 0
};