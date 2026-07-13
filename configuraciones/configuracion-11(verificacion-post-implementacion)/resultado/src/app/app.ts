import { Component, inject, afterNextRender, Injector } from '@angular/core';
import { GameEngineService } from './services/game-engine.service';
import { GameStatus } from './models/game.models';
import { WelcomeScreen } from './components/welcome-screen/welcome-screen';
import { Game } from './components/game/game';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeScreen, Game],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private gameEngine = inject(GameEngineService);
  private injector = inject(Injector);

  readonly gameState = this.gameEngine.gameState;
  readonly GameStatus = GameStatus;

  onStartGame(): void {
    this.gameEngine.startGame();
  }
}
