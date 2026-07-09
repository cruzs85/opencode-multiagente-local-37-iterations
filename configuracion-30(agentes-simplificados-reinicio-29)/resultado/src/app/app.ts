import { Component, inject } from '@angular/core';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameComponent } from './game/game.component';
import { GameOverComponent } from './game-over/game-over.component';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  imports: [WelcomeComponent, GameComponent, GameOverComponent],
  template: `
    @switch (gameService.state().screen) {
      @case ('welcome') {
        <app-welcome />
      }
      @case ('playing') {
        <app-game />
      }
      @case ('gameover') {
        <app-game-over />
      }
    }
  `,
  styleUrl: './app.scss'
})
export class App {
  gameService = inject(GameService);
}
