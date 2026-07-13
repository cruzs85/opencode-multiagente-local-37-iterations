import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  gameService = inject(GameService);
  highScoreService = inject(HighScoreService);
  private router = inject(Router);

  score = this.gameService.score.asReadonly();

  playAgain() {
    this.router.navigate(['/game']);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}