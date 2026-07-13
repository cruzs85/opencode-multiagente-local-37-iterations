import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameOverComponent } from './game-over.component';
import { GameService } from '../game.service';
import { vi, beforeEach, describe, it, expect } from 'vitest';

describe('GameOverComponent', () => {
  let component: GameOverComponent;
  let fixture: ComponentFixture<GameOverComponent>;
  let mockGameService: any;

  beforeEach(async () => {
    mockGameService = {
      state: vi.fn(),
      highScore: vi.fn(),
      resetGame: vi.fn(),
      startGame: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [GameOverComponent],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameOverComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render GAME OVER text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.game-over-title');
    expect(titleElement?.textContent).toContain('GAME OVER');
  });

  it('should show final score', () => {
    mockGameService.state.mockReturnValue({ score: 150 } as any);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const scoreElement = compiled.querySelector('.final-score');
    expect(scoreElement?.textContent).toContain('150');
  });

  it('should show high score', () => {
    mockGameService.state.mockReturnValue({ score: 150 } as any);
    mockGameService.highScore.mockReturnValue(200);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const highScoreElement = compiled.querySelector('.high-score');
    expect(highScoreElement?.textContent).toContain('200');
  });

  it('should call resetGame and startGame on retry', () => {
    component.retryGame();
    expect(mockGameService.resetGame).toHaveBeenCalled();
    expect(mockGameService.startGame).toHaveBeenCalled();
  });

  it('should call resetGame on goToMenu', () => {
    component.goToMenu();
    expect(mockGameService.resetGame).toHaveBeenCalled();
  });

  it('should show new record message when score >= highScore', () => {
    mockGameService.state.mockReturnValue({ score: 200 } as any);
    mockGameService.highScore.mockReturnValue(150);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const newRecordElement = compiled.querySelector('.new-record');
    expect(newRecordElement).toBeTruthy();
  });
});