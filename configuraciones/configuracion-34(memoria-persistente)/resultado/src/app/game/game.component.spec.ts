import { TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';
import { Router } from '@angular/router';
import { vi } from 'vitest';

describe('GameComponent', () => {
  let mockGameService: any;
  let mockHighScoreService: any;
  let mockRouter: any;

  const mockCtx = {
    canvas: { width: 800, height: 400 },
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    closePath: vi.fn(),
    shadowBlur: 0,
    shadowColor: '',
    fillStyle: '',
    strokeStyle: '',
    font: '',
    textAlign: '',
  };

  beforeEach(async () => {
    // Mock del contexto del canvas
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
    
    mockGameService = {
      score: vi.fn().mockReturnValue(0),
      isGameOver: vi.fn().mockReturnValue(false),
      incrementScore: vi.fn(),
      gameOver: vi.fn(),
    };
    
    mockHighScoreService = {
      getHighScore: vi.fn().mockReturnValue(100),
    };
    
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: HighScoreService, useValue: mockHighScoreService },
        { provide: Router, useValue: mockRouter },
      ]
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render canvas', () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('canvas')).toBeTruthy();
  });

  it('should display score', () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.score-value')).toBeTruthy();
  });

  it('should display high score', () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.high-score-container')).toBeTruthy();
  });

  it('should have data attributes', () => {
    const fixture = TestBed.createComponent(GameComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const container = compiled.querySelector('.game-container');
    expect(container.getAttribute('data-game-state')).toBeTruthy();
    expect(container.getAttribute('data-jump-count')).toBeTruthy();
    expect(container.getAttribute('data-obstacle-count')).toBeTruthy();
    expect(container.getAttribute('data-dino-y')).toBeTruthy();
  });

  it('should initialize canvas and start game on ngAfterViewInit', () => {
    const fixture = TestBed.createComponent(GameComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    
    // Verificar que el contexto fue llamado
    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled();
  });
});
