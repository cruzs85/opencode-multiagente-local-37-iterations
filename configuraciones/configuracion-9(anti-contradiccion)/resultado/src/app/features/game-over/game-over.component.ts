import { Component, inject, HostListener } from '@angular/core';
import { GameService } from '../../core/services/game.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  gameService = inject(GameService);

  @HostListener('document:keydown.space', ['$event'])
  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.restartGame();
  }

  restartGame(): void {
    this.gameService.restart();
  }
}
