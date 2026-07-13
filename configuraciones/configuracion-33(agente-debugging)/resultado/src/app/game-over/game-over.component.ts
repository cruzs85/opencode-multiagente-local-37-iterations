import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-over.component.html',
  styleUrls: ['./game-over.component.scss']
})
export class GameOverComponent {
  activatedRoute = inject(ActivatedRoute);
  highScoreService = inject(HighScoreService);

  score = signal<number>(0);
  highScore = this.highScoreService.getHighScore();

  constructor() {
    const scoreParam = this.activatedRoute.snapshot.queryParams['score'];
    this.score.set(scoreParam ? parseInt(scoreParam, 10) : 0);
  }
}