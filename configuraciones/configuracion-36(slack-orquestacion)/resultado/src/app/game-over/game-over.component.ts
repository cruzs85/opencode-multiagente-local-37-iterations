import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  gameService = inject(GameService);
  highScoreService = inject(HighScoreService);
}