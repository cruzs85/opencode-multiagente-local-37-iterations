import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  private gameService = inject(GameService);
  private highScoreService = inject(HighScoreService);
  private router = inject(Router);

  finalScore = this.gameService.scoreSignal;
  highScore = this.highScoreService.highScore;

  playAgain() {
    this.router.navigate(['/game']);
  }
}