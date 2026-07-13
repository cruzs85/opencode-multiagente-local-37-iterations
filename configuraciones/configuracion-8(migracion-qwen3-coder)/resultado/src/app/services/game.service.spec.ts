import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { ScoreService } from './score.service';
import { GROUND_Y, JUMP_FORCE, INITIAL_SPEED, SPEED_INCREMENT } from '../models/game.model';

describe('GameService', () => {
  let service: GameService;
  let scoreService: any;

  beforeEach(() => {
    scoreService = {
      highScore: vi.fn().mockReturnValue(0),
      saveHighScore: vi.fn(),
      loadHighScore: vi.fn(),
      resetHighScore: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: ScoreService, useValue: scoreService }
      ]
    });

    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start game with correct initial state', () => {
    service.startGame();
    expect(service.gameState().isRunning).toBe(true);
    expect(service.gameState().isStarted).toBe(true);
    expect(service.gameState().isGameOver).toBe(false);
    expect(service.gameState().score).toBe(0.1);
    expect(service.gameState().gameSpeed).toBe(INITIAL_SPEED + SPEED_INCREMENT);
  });

  it('should handle jump when game is running', () => {
    service.startGame();
    service.jump();
    expect(service.gameState().dinosaur.velocityY).toBe(JUMP_FORCE);
    expect(service.gameState().dinosaur.jumpCount).toBe(1);
  });

  it('should allow double jump', () => {
    service.startGame();
    service.jump();
    service.jump();
    expect(service.gameState().dinosaur.jumpCount).toBe(2);
  });

  it('should not allow more than 2 jumps', () => {
    service.startGame();
    service.jump();
    service.jump();
    service.jump();
    expect(service.gameState().dinosaur.jumpCount).toBe(2);
  });

  it('should not jump when not running', () => {
    service.jump();
    expect(service.gameState().dinosaur.jumpCount).toBe(0);
  });

  it('should stop game', () => {
    service.startGame();
    service.stopGame();
    expect(service.gameState().isRunning).toBe(false);
  });

  it('should reset game', () => {
    service.startGame();
    service.resetGame();
    expect(service.gameState().isStarted).toBe(false);
  });

  it('should detect collision', () => {
    const dinosaur = {
      x: 100, y: 350, width: 40, height: 40,
      velocityY: 0, jumpCount: 0, isJumping: false, isRunning: true
    };
    const obstacle = {
      type: 'cactus' as const,
      x: 110, y: 350, width: 20, height: 40, passed: false
    };

    const result = (service as any).checkCollision(dinosaur, obstacle);
    expect(result).toBe(true);
  });

  it('should not detect collision when far apart', () => {
    const dinosaur = {
      x: 100, y: 350, width: 40, height: 40,
      velocityY: 0, jumpCount: 0, isJumping: false, isRunning: true
    };
    const obstacle = {
      type: 'cactus' as const,
      x: 300, y: 350, width: 20, height: 40, passed: false
    };

    const result = (service as any).checkCollision(dinosaur, obstacle);
    expect(result).toBe(false);
  });

  it('should move dinosaur up when jumping (integration test)', () => {
    service.startGame();
    const initialY = service.gameState().dinosaur.y;
    expect(initialY).toBe(GROUND_Y);
    
    service.jump();
    
    // Verify jump set the velocity correctly
    expect(service.gameState().dinosaur.velocityY).toBe(JUMP_FORCE);
    expect(service.gameState().dinosaur.jumpCount).toBe(1);
    
    // Manually call update() (private method) to simulate what gameLoop does
    // This tests the physics: gravity + velocity = position change
    (service as any).update();
    
    // After update, the dino should have moved UP (y decreased)
    // velocityY = -12 + 0.6 = -11.4, y = 350 + (-11.4) = 338.6
    expect(service.gameState().dinosaur.y).toBeLessThan(initialY);
    expect(service.gameState().dinosaur.velocityY).toBeGreaterThan(JUMP_FORCE);
  });
});
