import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load high score from localStorage on init', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('150');
    vi.spyOn(Storage.prototype, 'setItem');
    
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    expect(service.highScore()).toBe(150);
  });

  it('should start with 0 if no localStorage value', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem');
    
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    expect(service.highScore()).toBe(0);
  });

  it('should save score to localStorage if higher than current', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    vi.spyOn(Storage.prototype, 'setItem');
    
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    service.saveScore(150);
    
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('dino-high-score', '150');
    expect(service.highScore()).toBe(150);
  });

  it('should NOT save score if lower than current', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('200');
    vi.spyOn(Storage.prototype, 'setItem');
    
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    service.saveScore(150);
    
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
    expect(service.highScore()).toBe(200);
  });

  it('should update highScore signal when saving', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('50');
    vi.spyOn(Storage.prototype, 'setItem');
    
    TestBed.configureTestingModule({});
    const service = TestBed.inject(HighScoreService);
    
    service.saveScore(100);
    
    expect(service.highScore()).toBe(100);
  });
});
