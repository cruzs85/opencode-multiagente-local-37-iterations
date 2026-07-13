import { Component, signal } from '@angular/core';
import { Welcome } from './welcome/welcome';
import { Game } from './game/game';
import { GameOver } from './game-over/game-over';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Welcome, Game, GameOver],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly screen = signal<'welcome' | 'game' | 'game-over'>('welcome');
  protected readonly score = signal(0);

  constructor() {
    console.log('[DIAG] AppComponent inicializado');
    window.onerror = (msg, url, line) => { 
      console.error('[DIAG] Error:', msg, 'en', url, 'linea', line); 
      return false; 
    };
  }

  startGame() {
    this.screen.set('game');
  }

  endGame(score: number) {
    this.score.set(score);
    this.screen.set('game-over');
  }

  retry() {
    this.score.set(0);
    this.screen.set('game');
  }

  backToMenu() {
    this.screen.set('welcome');
  }
}