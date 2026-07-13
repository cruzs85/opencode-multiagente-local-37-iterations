import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { GameOverComponent } from './game-over.component';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';
import { vi } from 'vitest';

describe('GameOverComponent', () => {
  let component: GameOverComponent;
  let fixture: ComponentFixture<GameOverComponent>;
  let mockGameService: any;
  let mockHighScoreService: any;

  beforeEach(async () => {
    mockGameService = {
      scoreSignal: vi.fn().mockReturnValue(100),
    };
    
    mockHighScoreService = {
      highScore: vi.fn().mockReturnValue(150),
    };

    await TestBed.configureTestingModule({
      imports: [GameOverComponent],
      providers: [
        provideRouter([]),
        { provide: GameService, useValue: mockGameService },
        { provide: HighScoreService, useValue: mockHighScoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display final score', () => {
    const scoreElement = fixture.debugElement.query(By.css('.final-score'));
    expect(scoreElement).toBeTruthy();
  });

  it('should display high score', () => {
    const highScoreElement = fixture.debugElement.query(By.css('.high-score'));
    expect(highScoreElement).toBeTruthy();
  });

  it('should have a play again button', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toContain('PLAY AGAIN');
  });
});
