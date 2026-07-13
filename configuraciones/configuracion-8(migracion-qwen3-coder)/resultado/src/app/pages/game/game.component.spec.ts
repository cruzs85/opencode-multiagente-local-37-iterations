import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { ScoreService } from '../../services/score.service';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let mockGameService: any;
  let mockScoreService: any;

  beforeEach(async () => {
    mockGameService = {
      startGame: vi.fn(),
      jump: vi.fn(),
      gameState: vi.fn().mockReturnValue({
        dinosaur: { x: 80, y: 350, width: 40, height: 40, velocityY: 0, jumpCount: 0, isJumping: false, isRunning: false },
        obstacles: [],
        score: 0,
        highScore: 0,
        gameSpeed: 5,
        isGameOver: false,
        isRunning: false,
        isStarted: false,
        groundOffset: 0
      })
    };

    mockScoreService = {
      highScore: vi.fn().mockReturnValue(0)
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: ScoreService, useValue: mockScoreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call startGame on gameService', () => {
    component.startGame();
    expect(mockGameService.startGame).toHaveBeenCalled();
  });

  it('should call startGame and jump when space is pressed and game is not running', () => {
    // Mock gameState to return a non-running state
    mockGameService.gameState.mockReturnValue({
      dinosaur: { x: 80, y: 350, width: 40, height: 40, velocityY: 0, jumpCount: 0, isJumping: false, isRunning: false },
      obstacles: [],
      score: 0,
      highScore: 0,
      gameSpeed: 5,
      isGameOver: false,
      isRunning: false,
      isStarted: false,
      groundOffset: 0
    });

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    component.handleKeydown(event);

    expect(mockGameService.startGame).toHaveBeenCalled();
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should call jump when space is pressed and game is already running', () => {
    // Mock gameState to return a running state
    mockGameService.gameState.mockReturnValue({
      dinosaur: { x: 80, y: 350, width: 40, height: 40, velocityY: 0, jumpCount: 0, isJumping: false, isRunning: true },
      obstacles: [],
      score: 0,
      highScore: 0,
      gameSpeed: 5,
      isGameOver: false,
      isRunning: true,
      isStarted: true,
      groundOffset: 0
    });

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    component.handleKeydown(event);

    expect(mockGameService.jump).toHaveBeenCalled();
    expect(mockGameService.startGame).not.toHaveBeenCalled();
  });

  it('should call startGame and jump when arrow up is pressed and game is not running', () => {
    // Mock gameState to return a non-running state
    mockGameService.gameState.mockReturnValue({
      dinosaur: { x: 80, y: 350, width: 40, height: 40, velocityY: 0, jumpCount: 0, isJumping: false, isRunning: false },
      obstacles: [],
      score: 0,
      highScore: 0,
      gameSpeed: 5,
      isGameOver: false,
      isRunning: false,
      isStarted: false,
      groundOffset: 0
    });

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.handleKeydown(event);

    expect(mockGameService.startGame).toHaveBeenCalled();
    expect(mockGameService.jump).toHaveBeenCalled();
  });
});