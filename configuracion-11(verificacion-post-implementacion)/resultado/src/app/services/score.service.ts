import { Injectable, signal, afterNextRender, Injector, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  private readonly _highScore = signal<number>(0);
  readonly highScore = this._highScore.asReadonly();
  private injector = inject(Injector);

  constructor() {
    // Cargar el highScore al inicio
  }

  init(): void {
    afterNextRender(() => {
      const saved = localStorage.getItem('dino-runner-highscore');
      if (saved) {
        this._highScore.set(parseInt(saved, 10) || 0);
      }
    }, { injector: this.injector });
  }

  saveScore(score: number): void {
    afterNextRender(() => {
      if (score > this._highScore()) {
        this._highScore.set(score);
        localStorage.setItem('dino-runner-highscore', score.toString());
      }
    }, { injector: this.injector });
  }

  loadScore(): number {
    return this._highScore();
  }

  resetHighScore(): void {
    afterNextRender(() => {
      this._highScore.set(0);
      localStorage.removeItem('dino-runner-highscore');
    }, { injector: this.injector });
  }
}
