import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize signals correctly', () => {
    expect(service.score()).toBe(0);
    expect(service.isGameOver()).toBe(false);
    expect(service.isPlaying()).toBe(false);
    expect(service.speed()).toBe(5);
  });

  it('should start game correctly', () => {
    service.startGame();
    expect(service.score()).toBe(0);
    expect(service.isGameOver()).toBe(false);
    expect(service.isPlaying()).toBe(true);
    expect(service.speed()).toBe(5);
  });

  it('should stop game correctly', () => {
    service.startGame();
    service.stopGame();
    expect(service.isPlaying()).toBe(false);
  });

  it('should end game correctly', () => {
    service.startGame();
    service.gameOver();
    expect(service.isGameOver()).toBe(true);
    expect(service.isPlaying()).toBe(false);
  });

  it('should increment score correctly', () => {
    service.incrementScore();
    expect(service.score()).toBe(1);
    
    service.incrementScore();
    expect(service.score()).toBe(2);
  });

  it('should increase speed correctly', () => {
    service.increaseSpeed();
    expect(service.speed()).toBeCloseTo(5.1, 10);
    
    service.increaseSpeed();
    expect(service.speed()).toBeCloseTo(5.2, 10);
  });

  it('should reset game correctly', () => {
    service.startGame();
    service.incrementScore();
    service.increaseSpeed();
    service.gameOver();
    
    service.reset();
    expect(service.score()).toBe(0);
    expect(service.isGameOver()).toBe(false);
    expect(service.isPlaying()).toBe(false);
    expect(service.speed()).toBe(5);
  });
});
