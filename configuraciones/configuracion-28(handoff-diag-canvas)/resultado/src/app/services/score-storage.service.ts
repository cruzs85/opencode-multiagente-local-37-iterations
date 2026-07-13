import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreStorageService {
  private readonly localStorageKey = 'dino-runner-highscore';

  getHighScore(): number {
    const highScore = localStorage.getItem(this.localStorageKey);
    return highScore ? parseInt(highScore, 10) : 0;
  }

  setHighScore(score: number): void {
    localStorage.setItem(this.localStorageKey, score.toString());
  }
}