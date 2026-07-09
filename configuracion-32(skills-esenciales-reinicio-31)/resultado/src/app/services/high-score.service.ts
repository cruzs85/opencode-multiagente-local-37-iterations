import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  readonly STORAGE_KEY = 'dino-runner-high-score';

  getHighScore(): number {
    const highScore = localStorage.getItem(this.STORAGE_KEY);
    return highScore ? parseInt(highScore, 10) : 0;
  }

  setHighScore(score: number): void {
    localStorage.setItem(this.STORAGE_KEY, score.toString());
  }

  highScore = signal<number>(this.getHighScore());
}