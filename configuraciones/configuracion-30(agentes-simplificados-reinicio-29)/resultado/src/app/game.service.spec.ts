import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { GameState, GameScreen } from './game.state';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct initial state', () => {
    const state = service['state']();
    expect(state.screen).toBe('welcome');
    expect(state.score).toBe(0);
    expect(state.highScore).toBe(0);
    expect(state.isRunning).toBe(false);
  });

  it('should change screen to playing when startGame is called', () => {
    service.startGame();
    const state = service['state']();
    expect(state.screen).toBe('playing');
    expect(state.isRunning).toBe(true);
  });

  it('should increase dino velocity and jumpCount when jump is called', () => {
    service.startGame();
    const initialJumpCount = service['state']().jumpCount;
    service.jump();
    const state = service['state']();
    expect(state.jumpCount).toBe(initialJumpCount + 1);
    expect(state.dinoVelocityY).toBe(26); // JUMP_FORCE
  });

  it('should allow double jump', () => {
    service.startGame();
    service.jump(); // Primer salto
    service.jump(); // Segundo salto
    const state = service['state']();
    expect(state.jumpCount).toBe(2);
    expect(state.dinoVelocityY).toBe(20); // SECOND_JUMP_FORCE
  });

  it('should update high score correctly', () => {
    service.startGame();
    service['state'].set({ ...service['state'](), score: 100 });
    
    // Simular el llamado a gameOver que actualiza highScore
    const currentState = service['state']();
    const newHighScore = Math.max(currentState.highScore, currentState.score);
    service['highScore'].set(newHighScore);
    
    expect(service['highScore']()).toBe(100);
  });

  it('should detect collision between dino and obstacle', () => {
    service.startGame();
    
    // Simular un obstáculo en la posición del dino
    const obstacle = {
      id: 1,
      x: 100,
      y: 50,
      width: 30,
      height: 50,
      type: 'cactus'
    };
    
    service['state'].update(state => ({
      ...state,
      obstacles: [obstacle]
    }));
    
    const gameOverSpy = vi.spyOn(service, 'gameOver');
    
    service['checkCollisions']();
    
    expect(gameOverSpy).toHaveBeenCalled();
  });
});