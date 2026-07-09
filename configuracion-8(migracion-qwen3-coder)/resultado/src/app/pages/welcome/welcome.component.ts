import { Component, inject, output } from '@angular/core';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  private readonly scoreService = inject(ScoreService);
  readonly highScore = this.scoreService.highScore;
  readonly startGame = output<void>();

  onStartClick(): void {
    this.startGame.emit();
  }
}