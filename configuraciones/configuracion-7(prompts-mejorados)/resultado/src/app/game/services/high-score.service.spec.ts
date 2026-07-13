import { TestBed } from '@angular/core/testing';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  let service: HighScoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [HighScoreService],
    });
    service = TestBed.inject(HighScoreService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with high score 0', () => {
    expect(service.highScore()).toBe(0);
  });

  it('should save and load high score from localStorage', () => {
    service.saveHighScore(100);
    expect(service.highScore()).toBe(100);
    expect(localStorage.getItem('dino-runner-high-score')).toBe('100');
  });

  it('should update high score if new score is higher', () => {
    service.saveHighScore(50);
    service.updateIfHigher(100);
    expect(service.highScore()).toBe(100);
  });

  it('should NOT update high score if new score is lower', () => {
    service.saveHighScore(100);
    service.updateIfHigher(50);
    expect(service.highScore()).toBe(100);
  });

  it('should reset high score to 0', () => {
    service.saveHighScore(100);
    service.resetHighScore();
    expect(service.highScore()).toBe(0);
    expect(localStorage.getItem('dino-runner-high-score')).toBeNull();
  });

  it('should load existing high score from localStorage', () => {
    localStorage.setItem('dino-runner-high-score', '250');
    const newService = TestBed.inject(HighScoreService);
    newService.loadHighScore();
    expect(newService.highScore()).toBe(250);
  });
});
