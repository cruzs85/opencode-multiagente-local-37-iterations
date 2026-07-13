import { Component, afterNextRender, DestroyRef, inject, output, signal } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class Welcome {
  private gameService = inject(GameService);
  private destroyRef = inject(DestroyRef);

  readonly isHovering = signal(false);
  readonly startGame = output<void>();

  onStartGame() {
    this.startGame.emit();
  }

  constructor() {
    afterNextRender(() => {
      const handler = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
          this.onStartGame();
        }
      };
      window.addEventListener('keydown', handler);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('keydown', handler);
      });
    });
  }
}