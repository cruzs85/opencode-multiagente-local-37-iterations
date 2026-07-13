import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoreService]
    });
    service = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 0 when no high score stored', () => {
    expect(service.highScore()).toBe(0);
  });

  it('should not overwrite high score with lower score', () => {
    service.updateHighScore(100);
    service.updateHighScore(50);
    expect(service.highScore()).toBe(100);
  });

  it('should update high score with higher score', () => {
    service.updateHighScore(100);
    service.updateHighScore(200);
    expect(service.highScore()).toBe(200);
  });

  it('signal should reflect high score changes', () => {
    service.updateHighScore(100);
    expect(service.highScore()).toBe(100);
    
    service.updateHighScore(150);
    expect(service.highScore()).toBe(150);
  });
});