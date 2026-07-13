import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(service.gameStarted()).toBeFalse();
    expect(service.gameOver()).toBeFalse();
    expect(service.score()).toBe(0);
    expect(service.highScore()).toBe(0);
    expect(service.gameSpeed()).toBe(5);
  });

  it('should start the game correctly', () => {
    service.startGame();
    expect(service.gameStarted()).toBeTrue();
    expect(service.gameOver()).toBeFalse();
    expect(service.score()).toBe(0);
  });

  it('should reset the game correctly', () => {
    service.startGame();
    service.resetGame();
    expect(service.gameOver()).toBeTrue();
  });

  it('should handle jumping correctly', () => {
    service.startGame();
    expect(service.isJumping()).toBeFalse();
    
    service.jump();
    expect(service.isJumping()).toBeTrue();
  });

  it('should increase game speed', () => {
    const initialSpeed = service.gameSpeed();
    service.increaseSpeed();
    expect(service.gameSpeed()).toBeGreaterThan(initialSpeed);
  });
});