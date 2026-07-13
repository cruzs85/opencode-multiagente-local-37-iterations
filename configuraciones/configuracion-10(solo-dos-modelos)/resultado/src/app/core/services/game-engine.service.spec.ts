import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine.service';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    // Mock localStorage para ScoreService
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem');

    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start in welcome state', () => {
    expect(service.gameState()).toBe('welcome');
  });

  it('should start game and set state to playing', () => {
    service.startGame();
    expect(service.gameState()).toBe('playing');
  });

  it('should have score 0 at start', () => {
    service.startGame();
    expect(service.score()).toBe(0);
  });

  it('should not jump when state is not playing', () => {
    const initialY = service.dinoY();
    service.jump();
    expect(service.dinoY()).toBe(initialY);
  });

  it('should go to game-over state when gameOver is called', () => {
    service.startGame();
    service.gameOver();
    expect(service.gameState()).toBe('game-over');
  });

  it('should reset to welcome when resetGame is called', () => {
    service.startGame();
    service.gameOver();
    service.resetGame();
    expect(service.gameState()).toBe('welcome');
  });
  
  it('should allow double jump', () => {
    service.startGame();
    
    // First jump sets jump count to 1 (triggered via jump())
    expect(() => service.jump()).not.toThrow();
    expect(() => service.jump()).not.toThrow();
    // No debería lanzar error al intentar tercer salto
    // Pero internamente no hará nada porque jumpCount < 2
    expect(() => service.jump()).not.toThrow();
  });

  it('should cancel animation frame on gameOver', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
    service.startGame();
    service.gameOver();
    expect(cancelSpy).toHaveBeenCalled();
  });
});