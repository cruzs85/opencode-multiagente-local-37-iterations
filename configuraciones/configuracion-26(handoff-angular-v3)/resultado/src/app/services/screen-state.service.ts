import { Injectable, signal } from '@angular/core';

export enum Screen {
  WELCOME = 'welcome',
  GAME = 'game',
  GAMEOVER = 'gameover'
}

@Injectable({ providedIn: 'root' })
export class ScreenStateService {
  readonly screen = signal<Screen>(Screen.WELCOME);

  startGame(): void {
    this.screen.set(Screen.GAME);
  }

  gameOver(): void {
    this.screen.set(Screen.GAMEOVER);
  }

  goToMenu(): void {
    this.screen.set(Screen.WELCOME);
  }
}
