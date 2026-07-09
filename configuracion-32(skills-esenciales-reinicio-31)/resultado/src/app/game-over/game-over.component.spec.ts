import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameOverComponent } from './game-over.component';
import { GameService } from '../services/game.service';
import { RouterLink } from '@angular/router';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('GameOverComponent', () => {
  let component: GameOverComponent;
  let fixture: ComponentFixture<GameOverComponent>;
  let mockGameService: Partial<GameService>;

  beforeEach(async () => {
    mockGameService = {
      score: signal(100),
      highScore: signal(150),
    };

    await TestBed.configureTestingModule({
      imports: [GameOverComponent, RouterLink],
      providers: [
        { provide: GameService, useValue: mockGameService },
        provideRouter([]),
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render GAME OVER title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.game-over-title') as HTMLElement;
    expect(title).toBeTruthy();
    expect(title.textContent?.trim()).toBe('GAME OVER');
  });

  it('should display score', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const scoreElement = compiled.querySelector('.game-over-score') as HTMLElement;
    expect(scoreElement).toBeTruthy();
    expect(scoreElement.textContent?.includes('100')).toBe(true);
  });

  it('should display high score', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const highScoreElement = compiled.querySelector('.game-over-high-score') as HTMLElement;
    expect(highScoreElement).toBeTruthy();
    expect(highScoreElement.textContent?.includes('150')).toBe(true);
  });

  it('should show new record message when score is higher than high score', () => {
    // Forzar que el score sea mayor que el high score
    (mockGameService as any).score = signal(200);
    (mockGameService as any).highScore = signal(150);
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const newRecordElement = compiled.querySelector('.new-record') as HTMLElement;
    expect(newRecordElement).toBeTruthy();
    expect(newRecordElement.textContent?.trim()).toBe('¡Nuevo Récord!');
  });

  it('should not show new record message when score is not higher than high score', () => {
    // Forzar que el score sea menor o igual al high score
    (mockGameService as any).score = signal(100);
    (mockGameService as any).highScore = signal(150);
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const newRecordElement = compiled.querySelector('.new-record');
    expect(newRecordElement).toBeFalsy();
  });

  it('should have retry button with routerLink to /game', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const retryButton = compiled.querySelector('a.btn-retry') as HTMLAnchorElement;
    expect(retryButton).toBeTruthy();
    expect(retryButton.getAttribute('routerLink')).toBe('/game');
  });
});
