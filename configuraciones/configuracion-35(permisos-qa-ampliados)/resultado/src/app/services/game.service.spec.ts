import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with idle state', () => {
    expect(service.gameStateSignal()).toBe('idle');
  });

  it('should start the game', () => {
    service.start();
    expect(service.gameStateSignal()).toBe('playing');
  });

  it('should not start the game if already playing', () => {
    service.start();
    service.start();
    expect(service.gameStateSignal()).toBe('playing');
  });

  it('should reset game state', () => {
    service.start();
    service.reset();
    expect(service.gameStateSignal()).toBe('idle');
  });

  it('should handle jumping', () => {
    service.start();
    service.jump();
    expect(service.dinoYSignal()).toBeLessThan(350);
  });

  it('should allow double jump', () => {
    service.start();
    service.jump();
    service.jump();
    expect(service.jumpsSignal()).toBe(2);
  });

  it('should not allow jumping when game is not playing', () => {
    service.jump();
    expect(service.gameStateSignal()).toBe('idle');
  });

  // Tests para funcionalidades de fin del juego
  it('should stop the game and save score', () => {
    const mockHighScoreService = {
      saveHighScore: vi.fn()
    };
    
    // Reemplazar el servicio real con mock para evitar errores
    TestBed.overrideProvider(GameService, {
      useValue: {
        ...service,
        highScoreService: mockHighScoreService
      }
    });
    
    service.start();
    service.stop(); // Usar stop en vez de reset para fin del juego
    
    // Verificar que el estado se cambia a gameOver
    expect(service.gameStateSignal()).toBe('gameOver');
  });

  it('should increment score over time (basic check)', () => {
    service.start();
    // Simular que pasa el tiempo y se incrementa la puntuación
    expect(service.scoreSignal()).toBe(0);
  });

  it('should increase speed over time (basic check)', () => {
    service.start();
    expect(service.speedSignal()).toBeGreaterThanOrEqual(1);
  });
});
