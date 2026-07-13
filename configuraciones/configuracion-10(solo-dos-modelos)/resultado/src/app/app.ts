import { Component, inject } from '@angular/core';
import { GameEngineService } from './core/services/game-engine.service';
import { ScoreService } from './core/services/score.service';
import { WelcomeScreen } from './components/welcome-screen/welcome-screen';
import { GameBoardComponent } from './components/game-board/game-board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeScreen, GameBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly gameEngine = inject(GameEngineService);
  protected readonly scoreService = inject(ScoreService);
  protected readonly gameState = this.gameEngine.gameState;

  onStartGame(): void {
    this.gameEngine.startGame();
  }

  onResetGame(): void {
    this.gameEngine.resetGame();
  }
}
