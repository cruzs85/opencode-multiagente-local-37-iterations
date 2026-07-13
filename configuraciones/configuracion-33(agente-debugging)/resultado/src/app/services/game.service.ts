import { Injectable, inject } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  score = signal<number>(0);
  gameSpeed = signal<number>(5);
  isGameOver = signal<boolean>(false);
  isPlaying = signal<boolean>(false);

  startGame(): void {
    this.score.set(0);
    this.gameSpeed.set(5);
    this.isGameOver.set(false);
    this.isPlaying.set(true);
  }

  stopGame(): void {
    this.isPlaying.set(false);
  }

  incrementScore(): void {
    this.score.update(currentScore => currentScore + 1);
  }

  increaseSpeed(): void {
    this.gameSpeed.update(currentSpeed => currentSpeed + 0.5);
  }

  setGameOver(): void {
    this.isGameOver.set(true);
    this.isPlaying.set(false);
  }

  getScore() {
    return this.score.asReadonly();
  }

  getGameSpeed() {
    return this.gameSpeed.asReadonly();
  }

  getIsGameOver() {
    return this.isGameOver.asReadonly();
  }

  getIsPlaying() {
    return this.isPlaying.asReadonly();
  }
}