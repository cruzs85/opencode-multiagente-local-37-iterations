import { Component, inject, Injector, effect } from '@angular/core';
import { GameService } from './services/game.service';
import { WelcomeScreenComponent } from './components/welcome-screen/welcome-screen.component';
import { GameAreaComponent } from './components/game-area/game-area.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeScreenComponent, GameAreaComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private gameService = inject(GameService);
  private injector = inject(Injector);

  readonly phase = this.gameService.phase;

  // Efecto para manejar tecla Enter en pantalla de bienvenida
  constructor() {
    effect(() => {
      // Solo activamos el efecto para que Angular lo trackee
      const p = this.gameService.phase();
      // Si estamos en welcome, escuchamos Enter
      if (p === 'welcome') {
        // El manejador de teclado en GameArea no aplica aquí,
        // así que manejamos Enter desde el componente welcome
      }
    }, { injector: this.injector });
  }

  onEnterKey(): void {
    if (this.phase() === 'welcome') {
      this.gameService.startGame();
    }
  }
}
