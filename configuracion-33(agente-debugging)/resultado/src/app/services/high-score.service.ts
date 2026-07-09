import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  highScore = signal<number>(0);

  constructor() {
    const savedScore = localStorage.getItem('dino-high-score');
    if (savedScore) {
      this.highScore.set(parseInt(savedScore, 10));
    }
  }

  saveScore(score: number): void {
    if (score > this.highScore()) {
      this.highScore.set(score);
      localStorage.setItem('dino-high-score', score.toString());
    }
  }

  getHighScore() {
    return this.highScore.asReadonly();
  }
}