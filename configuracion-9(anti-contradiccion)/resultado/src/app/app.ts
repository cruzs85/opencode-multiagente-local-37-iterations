import { Component, inject } from '@angular/core';
import { WelcomeComponent } from './features/welcome/welcome.component';
import { GameComponent } from './features/game/game.component';
import { GameOverComponent } from './features/game-over/game-over.component';
import { GameService } from './core/services/game.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, GameComponent, GameOverComponent],
  template: `
    @if (gameService.status() === 'welcome') {
      <app-welcome></app-welcome>
    }
    @if (gameService.status() === 'playing') {
      <app-game></app-game>
    }
    @if (gameService.status() === 'game-over') {
      <app-game></app-game>
      <app-game-over></app-game-over>
    }
  `,
  styleUrl: './app.scss'
})
export class App {
  gameService = inject(GameService);
}
