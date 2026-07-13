import { Component, inject, output } from '@angular/core';
import { ScoreService } from '../services/score.service';
import { ScreenStateService } from '../services/screen-state.service';

@Component({
  selector: 'app-gameover',
  standalone: true,
  imports: [],
  templateUrl: './gameover.html',
  styleUrl: './gameover.scss'
})
export class GameoverComponent {
  private readonly scoreService = inject(ScoreService);
  private readonly screenState = inject(ScreenStateService);
  readonly retry = output<void>();
  readonly goToMenu = output<void>();

  protected get score(): number {
    return this.scoreService.currentScore();
  }

  protected get highScore(): number {
    return this.scoreService.highScore();
  }

  protected get isNewRecord(): boolean {
    return this.scoreService.isNewRecord();
  }

  protected onRetry(): void {
    this.screenState.startGame();
    this.retry.emit();
  }

  protected onMenu(): void {
    this.screenState.goToMenu();
    this.goToMenu.emit();
  }
}