import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine.service';
import { GameStatus } from '../models/game.models';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GameEngineService],
    });
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have Welcome status initially', () => {
    expect(service.gameState().status).toBe(GameStatus.Welcome);
  });

  it('should have initial dino properties', () => {
    const dino = service.gameState().dino;
    expect(dino.x).toBe(80);
    expect(dino.width).toBe(40);
    expect(dino.height).toBe(50);
    expect(dino.vy).toBe(0);
    expect(dino.isJumping).toBe(false);
    expect(dino.jumpCount).toBe(0);
  });

  it('should have highScore 0 initially', () => {
    expect(service.gameState().highScore).toBe(0);
  });

  it('should reset game correctly', () => {
    // Reset should set status back to Welcome
    service.resetGame();
    expect(service.gameState().status).toBe(GameStatus.Welcome);
    expect(service.isRunning()).toBe(false);
  });
});