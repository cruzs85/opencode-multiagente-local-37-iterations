import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly STORAGE_KEY = 'dino-runner-high-score';
  private readonly _highScore = signal<number>(this.loadHighScore());
  readonly highScore = this._highScore.asReadonly();

  private loadHighScore(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  }

  saveHighScore(score: number): void {
    if (score > this._highScore()) {
      this._highScore.set(score);
      localStorage.setItem(this.STORAGE_KEY, score.toString());
    }
  }

  resetHighScore(): void {
    this._highScore.set(0);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
