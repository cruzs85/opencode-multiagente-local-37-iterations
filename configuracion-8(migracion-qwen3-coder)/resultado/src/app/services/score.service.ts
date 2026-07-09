import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY = 'dino-runner-high-score';
  private readonly _highScore = signal<number>(0);

  readonly highScore = this._highScore.asReadonly();

  constructor() {
    this.loadHighScore();
  }

  loadHighScore(): void {
    try {
      const score = localStorage.getItem(this.STORAGE_KEY);
      if (score !== null) {
        const parsedScore = Number(score);
        if (!isNaN(parsedScore)) {
          this._highScore.set(parsedScore);
        }
      }
    } catch (error) {
      // En caso de error (localStorage no disponible o corrupto), dejamos el récord en 0
    }
  }

  saveHighScore(score: number): void {
    if (score > this._highScore()) {
      this._highScore.set(score);
      try {
        localStorage.setItem(this.STORAGE_KEY, score.toString());
      } catch (error) {
        // En caso de error al guardar, no hacemos nada
      }
    }
  }

  resetHighScore(): void {
    this._highScore.set(0);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      // En caso de error al eliminar, no hacemos nada
    }
  }
}