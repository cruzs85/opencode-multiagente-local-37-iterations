import { Component, input } from '@angular/core';

@Component({
  selector: 'app-score-board',
  standalone: true,
  templateUrl: './score-board.html',
  styleUrl: './score-board.scss'
})
export class ScoreBoard {
  readonly score = input.required<number>();
  readonly highScore = input.required<number>();
}
