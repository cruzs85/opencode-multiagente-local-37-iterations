import { Injectable, signal } from '@angular/core';

export interface ScoreData {
  highScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY = 'dino-runner-high-score';
  
  private readonly _highScore = signal<number>(0);
  readonly highScore = this._highScore.asReadonly();
  
  constructor() {
    this.loadHighScore();
  }
  
  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored !== null) {
        this._highScore.set(parseInt(stored, 10) || 0);
      }
    } catch {
      // localStorage no disponible (entorno SSR/test)
      this._highScore.set(0);
    }
  }
  
  saveHighScore(score: number): void {
    if (score > this._highScore()) {
      this._highScore.set(score);
      try {
        localStorage.setItem(this.STORAGE_KEY, score.toString());
      } catch {
        // localStorage no disponible
      }
    }
  }
  
  resetHighScore(): void {
    this._highScore.set(0);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // localStorage no disponible
    }
  }
}