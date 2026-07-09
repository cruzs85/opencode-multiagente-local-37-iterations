import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../game.service';
import { vi, beforeEach, describe, it, expect } from 'vitest';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let mockGameService: any;

  beforeEach(async () => {
    mockGameService = {
      state: vi.fn(),
      highScore: vi.fn(),
      jump: vi.fn(),
      startGame: vi.fn(),
      stopLoop: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render dino (emoji)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const dinoElement = compiled.querySelector('.dino');
    expect(dinoElement).toBeTruthy();
  });

  it('should render ground', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const groundElement = compiled.querySelector('.ground');
    expect(groundElement).toBeTruthy();
  });

  it('should show initial score of 0', () => {
    mockGameService.state.mockReturnValue({ 
      score: 0, 
      screen: 'playing', 
      speed: 5,
      dinoY: 0,
      dinoVelocityY: 0,
      isJumping: false,
      jumpCount: 0,
      obstacles: [],
      isRunning: false,
      lastObstacleTime: 0,
      gameTime: 0
    } as any);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const scoreElement = compiled.querySelector('.score-value');
    expect(scoreElement?.textContent).toContain('0');
  });

  it('should call gameService.jump() on space key press', () => {
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    component.onKeyDown(event);
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should call gameService.jump() on game click', () => {
    component.onGameClick();
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should call startGame on ngOnInit', () => {
    component.ngOnInit();
    expect(mockGameService.startGame).toHaveBeenCalled();
  });
});