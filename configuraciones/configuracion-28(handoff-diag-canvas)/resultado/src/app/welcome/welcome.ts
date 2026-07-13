import { Component, inject, afterNextRender, DestroyRef, signal } from '@angular/core';
import { GameEngineService } from '../services/game-engine.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
  private gameEngineService = inject(GameEngineService);
  protected highScore = signal<number>(this.gameEngineService.highScore());

  protected startGame() {
    this.gameEngineService.startGame();
  }

  constructor() {
    afterNextRender(() => {
      // Inicializar focus
      const button = document.querySelector('.play-button') as HTMLElement;
      if (button) {
        button.focus();
      }
    });

    const destroyRef = inject(DestroyRef);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        this.startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    destroyRef.onDestroy(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  }
}