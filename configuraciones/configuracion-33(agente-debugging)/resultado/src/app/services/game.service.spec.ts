import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with default values', () => {
    expect(service.score()).toBe(0);
    expect(service.gameSpeed()).toBe(5);
    expect(service.isGameOver()).toBe(false);
    expect(service.isPlaying()).toBe(false);
  });

  it('startGame should reset score, speed, set isPlaying=true, isGameOver=false', () => {
    // Set initial values
    service.score.set(100);
    service.gameSpeed.set(7);
    service.isGameOver.set(true);
    service.isPlaying.set(true);
    
    service.startGame();
    
    expect(service.score()).toBe(0);
    expect(service.gameSpeed()).toBe(5);
    expect(service.isGameOver()).toBe(false);
    expect(service.isPlaying()).toBe(true);
  });

  it('stopGame should set isPlaying=false', () => {
    service.isPlaying.set(true);
    service.stopGame();
    expect(service.isPlaying()).toBe(false);
  });

  it('incrementScore should increase score by 1', () => {
    service.score.set(10);
    service.incrementScore();
    expect(service.score()).toBe(11);
  });

  it('increaseSpeed should increase speed by 0.5', () => {
    service.gameSpeed.set(5);
    service.increaseSpeed();
    expect(service.gameSpeed()).toBe(5.5);
  });

  it('setGameOver should set isGameOver=true and isPlaying=false', () => {
    service.isPlaying.set(true);
    service.isGameOver.set(false);
    service.setGameOver();
    expect(service.isGameOver()).toBe(true);
    expect(service.isPlaying()).toBe(false);
  });

  it('getters should return readonly signals', () => {
    const score = service.getScore();
    const gameSpeed = service.getGameSpeed();
    const isGameOver = service.getIsGameOver();
    const isPlaying = service.getIsPlaying();
    
    expect(score).toBeDefined();
    expect(gameSpeed).toBeDefined();
    expect(isGameOver).toBeDefined();
    expect(isPlaying).toBeDefined();
  });
});
