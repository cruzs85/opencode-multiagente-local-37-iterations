import { Component, inject } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreService } from '../services/score.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  private gameService = inject(GameService);
  private scoreService = inject(ScoreService);
  
  protected highScore = this.scoreService.highScore;
  
  startGame(): void {
    this.gameService.startGame();
  }
}
