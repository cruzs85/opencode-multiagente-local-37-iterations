import { signal, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameService {
  score = signal(0);
  isGameOver = signal(false);
  isPlaying = signal(false);
  speed = signal(5);

  startGame(): void {
    this.score.set(0);
    this.isGameOver.set(false);
    this.isPlaying.set(true);
    this.speed.set(5);
  }

  stopGame(): void {
    this.isPlaying.set(false);
  }

  gameOver(): void {
    this.isGameOver.set(true);
    this.isPlaying.set(false);
  }

  incrementScore(): void {
    this.score.update(value => value + 1);
  }

  increaseSpeed(): void {
    this.speed.update(value => value + 0.1);
  }

  reset(): void {
    this.score.set(0);
    this.isGameOver.set(false);
    this.isPlaying.set(false);
    this.speed.set(5);
  }
}