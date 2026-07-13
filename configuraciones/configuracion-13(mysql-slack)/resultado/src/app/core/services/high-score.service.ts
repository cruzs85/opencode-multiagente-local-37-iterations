import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  private readonly HIGH_SCORE_KEY = 'dino-runner-high-score';
  private readonly _highScore = signal<number>(0);
  readonly highScore = this._highScore.asReadonly();

  constructor() {
    this.loadHighScore();
  }

  loadHighScore(): void {
    const highScore = localStorage.getItem(this.HIGH_SCORE_KEY);
    const parsedScore = highScore ? Number(highScore) : 0;
    const score = isNaN(parsedScore) ? 0 : parsedScore;
    this._highScore.set(score);
  }

  saveHighScore(score: number): void {
    if (score > this._highScore()) {
      this._highScore.set(score);
      localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
    }
  }

  resetHighScore(): void {
    localStorage.removeItem(this.HIGH_SCORE_KEY);
    this._highScore.set(0);
  }
}
