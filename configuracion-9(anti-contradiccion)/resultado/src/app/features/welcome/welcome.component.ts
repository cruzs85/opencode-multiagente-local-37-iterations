import { Component, inject, HostListener } from '@angular/core';
import { GameService } from '../../core/services/game.service';
import { ScoreService } from '../../core/services/score.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  gameService = inject(GameService);
  scoreService = inject(ScoreService);

  highScore = this.scoreService.highScore;

  @HostListener('document:keydown.space', ['$event'])
  handleKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
    this.startGame();
  }

  startGame(): void {
    this.gameService.startGame();
  }
}
