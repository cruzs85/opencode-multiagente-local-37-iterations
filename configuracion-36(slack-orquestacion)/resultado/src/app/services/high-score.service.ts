import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HighScoreService {
  private readonly STORAGE_KEY = 'dino-runner-high-score';
  highScore = signal<number>(0);

  constructor() {
    this.loadHighScore();
  }

  private loadHighScore(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.highScore.set(parseInt(saved, 10));
    }
  }

  saveScore(score: number): void {
    if (score > this.highScore()) {
      this.highScore.set(score);
      localStorage.setItem(this.STORAGE_KEY, score.toString());
    }
  }

  reset(): void {
    this.highScore.set(0);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}