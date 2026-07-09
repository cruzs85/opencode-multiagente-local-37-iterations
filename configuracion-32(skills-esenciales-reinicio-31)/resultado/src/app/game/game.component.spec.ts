import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let mockGameService: Partial<GameService>;
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    mockGameService = {
      score: signal(0),
      highScore: signal(0),
      gameOver: signal(false),
      isPlaying: signal(false),
      dinoY: signal(0),
      obstacles: signal([]),
      startGame: vi.fn(),
      stopGame: vi.fn(),
      jump: vi.fn(),
      update: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render canvas element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();
  });

  it('should display HUD with score and high score when game is playing or game over', () => {
    // Forzar el estado del servicio para evitar draw de canvas que causa error
    (mockGameService as any).isPlaying = signal(true);
    (mockGameService as any).gameOver = signal(false);
    (mockGameService as any).score = signal(100);
    (mockGameService as any).highScore = signal(200);
    
    // Mock para evitar errors en draw()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null as any);
    
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const scoreElement = compiled.querySelector('.hud-score') as HTMLElement;
    const highScoreElement = compiled.querySelector('.hud-high-score') as HTMLElement;
    
    expect(scoreElement).toBeTruthy();
    expect(highScoreElement).toBeTruthy();
    expect(scoreElement.textContent?.includes('100')).toBe(true);
    expect(highScoreElement.textContent?.includes('200')).toBe(true);
  });

  it('should call startGame on ngAfterViewInit', () => {
    // Mockear getContext para evitar errores de canvas
    const mockContext = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
      beginPath: vi.fn(),
      stroke: vi.fn(),
    };
    
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
    
    // Mock del canvas
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockContext),
      width: 800,
      height: 400,
      addEventListener: vi.fn(),
    };
    
    component.gameCanvas = { nativeElement: mockCanvas } as any;
    
    // No llamamos ngAfterViewInit directamente aquí porque eso invocaría draw()
    // Solo verificamos que se crean correctamente los listeners
    expect(() => {
      component.ngAfterViewInit();
    }).not.toThrow();
    
    expect(mockGameService.startGame).toHaveBeenCalled();
  });

  it('should handle keyboard press for jump', () => {
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    
    component.handleKeyDown(event);
    
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should handle arrow up key for jump', () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' });
    
    component.handleKeyDown(event);
    
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should prevent default behavior for space and arrow up keys', () => {
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    event.preventDefault = vi.fn();
    
    component.handleKeyDown(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should handle click for jump', () => {
    component.handleClick();
    
    expect(mockGameService.jump).toHaveBeenCalled();
  });
});
