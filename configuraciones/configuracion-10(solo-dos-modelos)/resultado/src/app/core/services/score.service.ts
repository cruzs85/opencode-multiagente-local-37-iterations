import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly _score = signal<number>(0);
  private readonly _highScore = signal<number>(0);
  private readonly localStorageKey = 'dino-runner-highscore';

  readonly score = this._score.asReadonly();
  readonly highScore = this._highScore.asReadonly();

  constructor() {
    // Al iniciar, intenta leer desde localStorage
    const highScoreFromStorage = localStorage.getItem(this.localStorageKey);
    if (highScoreFromStorage !== null && !isNaN(Number(highScoreFromStorage))) {
      this._highScore.set(Number(highScoreFromStorage));
    }

    // Efecto para sincronizar el highScore en localStorage
    effect(() => {
      const currentHighScore = this._highScore();
      localStorage.setItem(this.localStorageKey, currentHighScore.toString());
    });
  }

  incrementScore(value: number): void {
    this._score.update(currentScore => currentScore + value);
    
    // Si el nuevo score supera al highScore, actualizamos el highScore
    if (this._score() > this._highScore()) {
      this._highScore.set(this._score());
    }
  }

  resetScore(): void {
    this._score.set(0);
  }
}
