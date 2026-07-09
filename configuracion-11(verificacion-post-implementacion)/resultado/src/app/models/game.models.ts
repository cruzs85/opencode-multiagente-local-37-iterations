export enum GameStatus {
  Welcome = 'welcome',
  Playing = 'playing',
  GameOver = 'gameOver'
}

export interface Dino {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isJumping: boolean;
  jumpCount: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cactus' | 'rock';
}

export interface GameState {
  status: GameStatus;
  score: number;
  highScore: number;
  dino: Dino;
  obstacles: Obstacle[];
  speed: number;
  groundY: number;
  gameTime: number;
}
