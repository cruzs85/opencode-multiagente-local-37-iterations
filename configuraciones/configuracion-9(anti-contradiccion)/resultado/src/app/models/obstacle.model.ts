export type GameStatus = 'welcome' | 'playing' | 'game-over';

export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  groundY: number;
  jumpCount: number;
}

export type ObstacleType = 'cactus' | 'small-cactus' | 'bird' | 'group-cactus';

export interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}