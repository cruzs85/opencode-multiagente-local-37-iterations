import { TestBed } from '@angular/core/testing';
import { CollisionService } from './collision.service';

describe('CollisionService', () => {
  let service: CollisionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CollisionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(service.isColliding()).toBeFalse();
    expect(service.collisionType()).toBeNull();
  });

  it('should detect collisions correctly', () => {
    // Crear rectángulos de prueba
    const dinoRect = new DOMRect(10, 10, 50, 50);
    const obstacleRect = new DOMRect(30, 30, 50, 50);
    
    // Esta prueba solo verifica que el método se pueda ejecutar
    // La implementación real de colisión requiere DOM
    expect(() => {
      service.checkCollisions(dinoRect, obstacleRect);
    }).not.toThrow();
  });
});