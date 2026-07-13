import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  localStorageKey = 'dino-runner-high-score';

  getHighScore(): number {
    const highScore = localStorage.getItem(this.localStorageKey);
    return highScore ? parseInt(highScore, 10) : 0;
  }

  saveHighScore(score: number): void {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem(this.localStorageKey, score.toString());
    }
  }

  isNewRecord(score: number): boolean {
    return score > this.getHighScore();
  }
}