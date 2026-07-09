import { Component, inject } from '@angular/core';
import { GameService } from './services/game.service';
import { WelcomeComponent } from './welcome/welcome.component';
import { GameBoardComponent } from './game-board/game-board.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, GameBoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private gameService = inject(GameService);
  
  protected readonly gamePhase = this.gameService.gamePhase;
}
