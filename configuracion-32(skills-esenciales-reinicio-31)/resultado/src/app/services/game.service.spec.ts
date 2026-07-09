import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { HighScoreService } from './high-score.service';
import { signal } from '@angular/core';

describe('GameService', () => {
  let service: GameService;
  let mockHighScoreService: Partial<HighScoreService>;

  beforeEach(() => {
    mockHighScoreService = {
      getHighScore: vi.fn(),
      setHighScore: vi.fn(),
      highScore: signal(0)
    };

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: HighScoreService, useValue: mockHighScoreService }
      ]
    });
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('startGame', () => {
    it('should reset game state', () => {
      // Preparar con valores no por defecto
      service.score.set(100);
      service.speed.set(10);
      service.gameOver.set(true);
      service.isPlaying.set(true);
      service.jumpCount.set(1);
      service.obstacles.set([{ x: 100, y: 100, width: 20, height: 20 }]);

      service.startGame();

      expect(service.score()).toBe(0);
      expect(service.speed()).toBe(5);
      expect(service.gameOver()).toBe(false);
      expect(service.isPlaying()).toBe(true);
      expect(service.jumpCount()).toBe(0);
      expect(service.obstacles()).toEqual([]);
    });
  });

  describe('jump', () => {
    it('should increment jumpCount and apply jump force when jumpCount < 2', () => {
      service.jumpCount.set(0);
      service.dinoVelY.set(0);
      
      service.jump();
      
      expect(service.jumpCount()).toBe(1);
      expect(service.dinoVelY()).toBe(-12);
    });

    it('should not jump when jumpCount >= 2', () => {
      service.jumpCount.set(2);
      service.dinoVelY.set(5);
      
      service.jump();
      
      expect(service.jumpCount()).toBe(2);
      expect(service.dinoVelY()).toBe(5);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.startGame();
    });

    it('should not update when not playing and game not over', () => {
      service.isPlaying.set(false);
      service.gameOver.set(false);
      
      const initialScore = service.score();
      const initialObstacles = service.obstacles();
      
      service.update(1);
      
      expect(service.score()).toBe(initialScore);
      expect(service.obstacles()).toBe(initialObstacles);
    });

    it('should update score when game is playing', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      const initialScore = service.score();
      
      service.update(1);
      
      expect(service.score()).toBe(initialScore + 1);
    });

    it('should increment score by 1 unit per update', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      service.update(1);
      service.update(1);
      
      expect(service.score()).toBe(2);
    });

    it('should update obstacles position when game is playing', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      // Establecer algunos obstáculos
      service.obstacles.set([
        { x: 100, y: 100, width: 20, height: 20 },
        { x: 200, y: 150, width: 30, height: 30 }
      ]);
      
      const initialObstacles = service.obstacles();
      
      service.update(1);
      
      // Objetos se mueven a la izquierda (más pequeños)
      expect(service.obstacles()[0].x).toBeLessThan(initialObstacles[0].x);
      expect(service.obstacles()[1].x).toBeLessThan(initialObstacles[1].x);
    });

    it('should increase speed every 500 points', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      // Establecer score a 499 para que al sumar 1, se convierta en 500
      service.score.set(499);
      
      const initialSpeed = service.speed();
      
      service.update(1);
      
      expect(service.speed()).toBe(initialSpeed + 0.5);
    });

    it('should not increase speed when score not multiple of 500', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      service.score.set(250);
      
      const initialSpeed = service.speed();
      
      service.update(1);
      
      expect(service.speed()).toBe(initialSpeed);
    });
  });

  describe('collision detection', () => {
    beforeEach(() => {
      service.startGame();
    });

    it('should end game on collision', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      // Crear un obstáculo que esté en la posición del dino (más realista con posiciones)
      service.obstacles.set([{
        x: 50,     // Posición x del obstáculo igual al dino
        y: 110,    // Posición y del obstáculo (ajustada para colisión con el dino en y=110 a 150)
        width: 20,
        height: 40
      }]);
      
      // Simular que el dinosaurio está en colisión (no necesitamos mover el dino realmente)
      // ya que el algoritmo de colisión usa las posiciones definidas
      service.dinoY.set(0); // Posición en el suelo
      service.dinoVelY.set(0);
      
      // Actualizar para que se detecte la colisión efectivamente
      service.update(1);
      
      expect(service.gameOver()).toBe(true);
      expect(service.isPlaying()).toBe(false);
    });

    it('should update high score when score is higher than current high score', () => {
      service.isPlaying.set(true);
      service.gameOver.set(false);
      
      // Establecer un score mayor para que se actualice el high score
      service.score.set(100);
      
      // Crear un obstáculo para provocar colisión
      service.obstacles.set([{
        x: 50,
        y: 110,
        width: 20,
        height: 40
      }]);
      
      // Actualizar para detector de colisiones
      service.update(1);
      
      // El test solo verifica que el mock se haya llamado con el valor correcto
      // en el servicio real, el mock está definido en el beforeEach 
      expect(mockHighScoreService.setHighScore).toHaveBeenCalledWith(100);
    });
  });
});
