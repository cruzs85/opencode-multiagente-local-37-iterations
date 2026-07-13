import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly _score = signal(0);
  private readonly _highScore = signal(0);

  readonly score = this._score.asReadonly();
  readonly highScore = this._highScore.asReadonly();

  constructor() {
    // Leer high score desde localStorage en el constructor
    const savedHighScore = localStorage.getItem('dino-high-score');
    if (savedHighScore) {
      this._highScore.set(parseInt(savedHighScore, 10));
    }
  }

  updateScore(points: number): void {
    const currentScore = this._score() + points;
    this._score.set(currentScore);
    
    // Si el nuevo score es mayor que el high score, actualizarlo
    if (currentScore > this._highScore()) {
      this._highScore.set(currentScore);
      this.saveHighScore();
    }
  }

  resetScore(): void {
    this._score.set(0);
  }

  saveHighScore(): void {
    localStorage.setItem('dino-high-score', String(this._highScore()));
  }
}
