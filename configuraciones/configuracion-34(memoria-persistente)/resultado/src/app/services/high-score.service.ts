import { inject, signal, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HighScoreService {
  private highScore = signal<number>(0);

  constructor() {
    this.loadHighScore();
  }

  loadHighScore(): number {
    const stored = localStorage.getItem('dino-high-score');
    if (stored) {
      const score = parseInt(stored, 10);
      if (!isNaN(score)) {
        this.highScore.set(score);
        return score;
      }
    }
    return 0;
  }

  saveScore(score: number): void {
    const currentHighScore = this.highScore();
    if (score > currentHighScore) {
      this.highScore.set(score);
      localStorage.setItem('dino-high-score', score.toString());
    }
  }

  getHighScore(): number {
    return this.highScore();
  }
}