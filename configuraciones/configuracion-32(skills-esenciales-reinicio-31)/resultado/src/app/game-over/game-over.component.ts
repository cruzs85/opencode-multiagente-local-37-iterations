import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  private gameService = inject(GameService);

  score = this.gameService.score;
  highScore = this.gameService.highScore;
}