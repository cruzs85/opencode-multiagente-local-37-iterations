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

  it('should load high score from localStorage on initialization', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    const s = new HighScoreService();  // Crear instancia directamente
    expect(s.getHighScore()).toBe(100);
  });

  it('should return 0 when no high score in localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    const s = new HighScoreService();  // Crear instancia directamente
    expect(s.getHighScore()).toBe(0);
  });

  it('should save score to localStorage when higher than current', () => {
    service.saveScore(200);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('dino-high-score', '200');
  });

  it('should not save score to localStorage when lower than current', () => {
    // Test directo sin usar TestBed
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('300');
    const s = new HighScoreService();
    
    // Now try to save a lower score
    s.saveScore(200);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it('should not save score to localStorage when equal to current', () => {
    // Test directo sin usar TestBed
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('300');
    const s = new HighScoreService();
    
    // Now try to save equal score
    s.saveScore(300);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });

  it('should not save to localStorage when score is 0 and no existing high score', () => {
    service.saveScore(0);
    expect(Storage.prototype.setItem).not.toHaveBeenCalled();
  });
});
