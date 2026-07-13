import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly _gameStarted = signal(false);
  readonly gameStarted = this._gameStarted.asReadonly();

  private readonly _gameOver = signal(false);
  readonly gameOver = this._gameOver.asReadonly();

  startGame() {
    this._gameStarted.set(true);
    this._gameOver.set(false);
  }

  endGame() {
    this._gameOver.set(true);
  }

  resetGame() {
    this._gameStarted.set(false);
    this._gameOver.set(false);
  }
}