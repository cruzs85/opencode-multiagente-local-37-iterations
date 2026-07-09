import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private _score = signal<number>(0);
  public score = this._score.asReadonly();

  private _highScore = signal<number>(0);
  public highScore = this._highScore.asReadonly();

  updateScore(points: number): void {
    this._score.set(points);
  }

  updateHighScore(points: number): void {
    if (points > this._highScore()) {
      this._highScore.set(points);
    }
  }

  reset(): void {
    this._score.set(0);
  }
}