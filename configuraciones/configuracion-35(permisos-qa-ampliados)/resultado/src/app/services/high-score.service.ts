import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  private readonly HIGH_SCORE_KEY = 'dino-runner-high-score';
  
  private _highScore = signal<number>(this.loadHighScore());
  
  highScore = this._highScore.asReadonly();
  
  constructor() { }
  
  private loadHighScore(): number {
    const savedScore = localStorage.getItem(this.HIGH_SCORE_KEY);
    return savedScore ? parseInt(savedScore, 10) : 0;
  }
  
  getHighScore(): number {
    return this._highScore();
  }
  
  saveHighScore(score: number): void {
    if (score > this._highScore()) {
      this._highScore.set(score);
      localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
    }
  }
}