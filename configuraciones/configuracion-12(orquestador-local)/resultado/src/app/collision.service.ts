import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { GameService } from './game.service';

@Injectable({ providedIn: 'root' })
export class CollisionService {
  // Referencia al GameService
  private gameService = inject(GameService);

  // Estados de colisión
  private readonly _isColliding = signal(false);
  private readonly _collisionType = signal<'cactus' | 'ground' | null>(null);

  // Signals públicas
  readonly isColliding = this._isColliding.asReadonly();
  readonly collisionType = this._collisionType.asReadonly();

  // Derivados
  readonly collisionDetected = computed(() => {
    return this._isColliding();
  });

  constructor() {
    // Inicializar el servicio
  }

  // Verificar colisiones entre el dino y los obstáculos
  checkCollisions(dinoRect: DOMRect, obstacleRect: DOMRect): boolean {
    // Verificar si hay colisión entre dos rectángulos
    const collision = !(
      dinoRect.right < obstacleRect.left ||
      dinoRect.left > obstacleRect.right ||
      dinoRect.bottom < obstacleRect.top ||
      dinoRect.top > obstacleRect.bottom
    );

    // Actualizar estado de colisión
    this._isColliding.set(collision);
    
    if (collision) {
      // Determinar tipo de colisión
      if (obstacleRect.top > 0) {
        this._collisionType.set('cactus');
      } else {
        this._collisionType.set('ground');
      }
    }

    return collision;
  }

  // Verificar colisión con el suelo
  checkGroundCollision(dinoRect: DOMRect, groundRect: DOMRect): boolean {
    const collision = !(
      dinoRect.right < groundRect.left ||
      dinoRect.left > groundRect.right ||
      dinoRect.bottom < groundRect.top ||
      dinoRect.top > groundRect.bottom
    );

    this._isColliding.set(collision);
    
    if (collision) {
      this._collisionType.set('ground');
    }

    return collision;
  }

  // Verificar colisión con cactus
  checkCactusCollision(dinoRect: DOMRect, cactusRect: DOMRect): boolean {
    const collision = !(
      dinoRect.right < cactusRect.left ||
      dinoRect.left > cactusRect.right ||
      dinoRect.bottom < cactusRect.top ||
      dinoRect.top > cactusRect.bottom
    );

    this._isColliding.set(collision);
    
    if (collision) {
      this._collisionType.set('cactus');
    }

    return collision;
  }

  // Manejar colisión detectada
  handleCollision(): void {
    if (this._isColliding()) {
      // Detener el juego
      // En un entorno real, esto se haría a través del GameService
      // Por ahora, solo actualizamos el estado
      console.log('Colisión detectada:', this._collisionType());
    }
  }

  // Resetear estado de colisión
  resetCollision(): void {
    this._isColliding.set(false);
    this._collisionType.set(null);
  }
}