import { Component, inject, afterNextRender, DestroyRef, NgZone } from '@angular/core';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { GameCanvasComponent } from './game-canvas/game-canvas.component';
import { GameOverScreenComponent } from './game-over-screen/game-over-screen.component';
import { GameService } from './core/services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeScreenComponent, GameCanvasComponent, GameOverScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private gameService = inject(GameService)
  private ngZone = inject(NgZone)
  private destroyRef = inject(DestroyRef)

  readonly state = this.gameService.state

  // Manejar tecla ESPACIO global:
  // En afterNextRender, registrar keydown listener en window
  // Si la tecla es ' ' o 'Space' o 'ArrowUp':
  //   - Si state es 'welcome' → gameService.startGame()
  //   - Si state es 'playing' → gameService.jump()
  //   - Si state es 'gameover' → gameService.startGame()
  // Limpiar listener en DestroyRef
  constructor() {
    afterNextRender(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.code === 'Space' || event.code === 'ArrowUp') {
          event.preventDefault()
          if (this.gameService.state() === 'welcome') {
            this.gameService.startGame();
          } else if (this.gameService.state() === 'playing') {
            this.gameService.jump();
          } else if (this.gameService.state() === 'gameover') {
            this.gameService.startGame();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      this.destroyRef.onDestroy(() => {
        window.removeEventListener('keydown', handleKeyDown);
      });
    });
  }
}
