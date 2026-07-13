import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { HighScoreService } from './high-score.service';

describe('GameService', () => {
  let service: GameService;
  let highScoreService: HighScoreService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [GameService, HighScoreService],
    });
    service = TestBed.inject(GameService);
    highScoreService = TestBed.inject(HighScoreService);
  });

  afterEach(() => {
    service.cancelGameLoop();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial game state with isStarted=false', () => {
    const state = service.gameState();
    expect(state.isStarted).toBe(false);
    expect(state.isRunning).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.score).toBe(0);
    expect(state.cactuses.length).toBe(0);
    expect(state.speed).toBe(6);
  });

  it('should start the game', () => {
    service.startGame();
    const state = service.gameState();
    expect(state.isStarted).toBe(true);
    expect(state.isRunning).toBe(true);
    expect(state.isGameOver).toBe(false);
  });

  it('should handle jump when game is not running', () => {
    service.jump();
    const dino = service.dino();
    expect(dino.velocityY).toBe(0);
    expect(dino.isJumping).toBe(false);
  });

  it('should handle double jump logic', () => {
    service.startGame();
    service.jump();
    let dino = service.dino();
    expect(dino.jumpCount).toBe(1);
    expect(dino.isJumping).toBe(true);

    service.jump();
    dino = service.dino();
    expect(dino.jumpCount).toBe(2);

    service.jump();
    dino = service.dino();
    expect(dino.jumpCount).toBe(2);
  });

  it('should reset game correctly', () => {
    service.startGame();
    service.resetGame();
    const state = service.gameState();
    expect(state.isStarted).toBe(false);
    expect(state.isRunning).toBe(false);
    expect(state.isGameOver).toBe(false);
    expect(state.score).toBe(0);
    expect(state.cactuses.length).toBe(0);
  });

  it('should get high score from HighScoreService', () => {
    // Guardar high score ANTES de crear el servicio del juego
    highScoreService.saveHighScore(500);
    
    // Crear nuevo GameService que lea el high score actual
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [GameService, HighScoreService],
    });
    const newService = TestBed.inject(GameService);
    
    const state = newService.gameState();
    expect(state.highScore).toBe(500);
    
    newService.cancelGameLoop();
  });
});
