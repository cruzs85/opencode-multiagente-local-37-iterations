import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GameService } from './game.service';
import { HighScoreService } from './high-score.service';
import { signal } from '@angular/core';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize game state', () => {
    expect(service.gameState()).toBe('idle');
    expect(service.score()).toBe(0);
    expect(service.dinoJumpCount()).toBe(0);
  });

  it('should start game', () => {
    service.startGame();
    expect(service.gameState()).toBe('playing');
  });

  it('should handle jump', () => {
    // First start the game to set gameState to 'playing'
    service.startGame();
    service.jump();
    expect(service.dinoJumpCount()).toBe(1);
  });

  it('should update score', () => {
    service.score.set(100); // Directly set score
    expect(service.score()).toBe(100);
  });
});
