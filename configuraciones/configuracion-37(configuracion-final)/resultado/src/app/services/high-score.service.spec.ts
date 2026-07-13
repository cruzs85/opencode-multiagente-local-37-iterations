import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  beforeEach(() => {
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    expect(service).toBeTruthy();
  });

  it('should load high score from localStorage on init', () => {
    // Create a new TestBed with specific mock for this test
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    expect(service.highScore()).toBe(100);
  });

  it('should save high score to localStorage', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    service.saveHighScore(200);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('dinoRunnerHighScore', '200');
  });

  it('should not save lower score to localStorage', () => {
    // Create a new TestBed with specific mock for this test
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('300');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    // Save a lower score - this should not call setItem
    service.saveHighScore(200);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it('should update high score when new score is higher', () => {
    // Create a new TestBed with specific mock for this test
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    // Save a higher score - this should update the high score
    service.saveHighScore(200);
    expect(service.highScore()).toBe(200);
  });
});
