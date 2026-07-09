import { Component, inject, output } from '@angular/core';
import { ScoreService } from '../services/score.service';
import { ScreenStateService } from '../services/screen-state.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss'
})
export class WelcomeComponent {
  private readonly scoreService = inject(ScoreService);
  private readonly screenState = inject(ScreenStateService);
  readonly startGame = output<void>();

  protected get highScore(): number {
    return this.scoreService.highScore();
  }

  protected onStart(): void {
    this.screenState.startGame();
    this.startGame.emit();
  }
}