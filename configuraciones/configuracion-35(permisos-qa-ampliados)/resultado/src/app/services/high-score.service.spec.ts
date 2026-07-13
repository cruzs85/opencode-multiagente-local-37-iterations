import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  let service: HighScoreService;

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem');
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighScoreService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load high score from localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    const s = TestBed.inject(HighScoreService);
    expect(s.highScore()).toBe(100);
  });

  it('should save high score to localStorage', () => {
    service.saveHighScore(200);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('dino-runner-high-score', '200');
  });

  it('should not save score if not a new high score', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('300');
    service.saveHighScore(200);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it('should save new high score', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    service.saveHighScore(200);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('dino-runner-high-score', '200');
  });

  it('should get high score value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('150');
    const s = TestBed.inject(HighScoreService);
    expect(s.getHighScore()).toBe(150);
  });
});
