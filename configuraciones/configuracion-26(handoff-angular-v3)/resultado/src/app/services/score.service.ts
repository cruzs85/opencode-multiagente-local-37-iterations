import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  readonly currentScore = signal<number>(0);
  readonly highScore = signal<number>(0);
  private readonly STORAGE_KEY = 'dino-runner-high-score';

  constructor() {
    this.loadHighScore();
  }

  addScore(points: number): void {
    this.currentScore.update(s => s + points);
  }

  resetScore(): void {
    this.currentScore.set(0);
  }

  saveHighScore(): void {
    const current = this.currentScore();
    if (current > this.highScore()) {
      this.highScore.set(current);
      try {
        localStorage.setItem(this.STORAGE_KEY, String(current));
      } catch { /* ignore */ }
    }
  }

  loadHighScore(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.highScore.set(parseInt(saved, 10) || 0);
      }
    } catch { /* ignore */ }
  }

  isNewRecord(): boolean {
    return this.currentScore() > this.highScore() || this.currentScore() === this.highScore() && this.currentScore() > 0;
  }
}
