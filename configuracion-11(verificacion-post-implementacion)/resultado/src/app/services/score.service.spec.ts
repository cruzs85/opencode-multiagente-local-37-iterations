import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score.service';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoreService],
    });
    service = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize highScore as 0', () => {
    expect(service.loadScore()).toBe(0);
  });

  it('should return highScore value via loadScore', () => {
    expect(service.loadScore()).toEqual(0);
  });
});