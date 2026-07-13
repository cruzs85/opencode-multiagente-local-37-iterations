import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  highScore = signal(0);

  constructor() {
    this.loadHighScore();
  }

  loadHighScore() {
    const savedScore = localStorage.getItem('dinoRunnerHighScore');
    if (savedScore) {
      this.highScore.set(parseInt(savedScore, 10));
    }
  }

  saveHighScore(score: number) {
    if (score > this.highScore()) {
      this.highScore.set(score);
      localStorage.setItem('dinoRunnerHighScore', score.toString());
    }
  }
}