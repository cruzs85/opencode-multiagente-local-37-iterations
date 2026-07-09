import { TestBed } from '@angular/core/testing';
import { GameOverComponent } from './game-over.component';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { signal } from '@angular/core';

describe('GameOverComponent', () => {
  let mockGameService: any;
  let mockHighScoreService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockGameService = {
      score: signal(50),
    };
    
    mockHighScoreService = {
      getHighScore: vi.fn().mockReturnValue(100),
    };
    
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameOverComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: HighScoreService, useValue: mockHighScoreService },
        { provide: Router, useValue: mockRouter },
      ]
    }).compileComponents();

    // Crear el componente y detectar cambios
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render game over title', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.game-over-title')).toBeTruthy();
  });

  it('should display score', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.score-value')).toBeTruthy();
  });

  it('should display high score', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.high-score-value')).toBeTruthy();
  });

  it('should not show new record message when score <= high score', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.new-record')).toBeFalsy();
  });

  it('should show new record message when score > high score', () => {
    // Crear mock con un score mayor al high score para este test específico
    const mockGameServiceWithHighScore = {
      score: signal(150),
    };
    
    // Crear nuevo TestBed con el mock actualizado
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GameOverComponent],
      providers: [
        { provide: GameService, useValue: mockGameServiceWithHighScore },
        { provide: HighScoreService, useValue: mockHighScoreService },
        { provide: Router, useValue: mockRouter },
      ]
    });
    
    const fixture = TestBed.createComponent(GameOverComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.new-record')).toBeTruthy();
  });

  it('should call navigate to /game when playAgain is called', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    const component = fixture.componentInstance;
    
    component.playAgain();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game']);
  });

  it('should call navigate to / when goHome is called', () => {
    const fixture = TestBed.createComponent(GameOverComponent);
    const component = fixture.componentInstance;
    
    component.goHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
