import { Component, inject, computed, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements AfterViewInit, OnDestroy {
  gameService = inject(GameService);
  highScoreSignal = computed(() => this.gameService.highScoreSignal());

  private keydownHandler = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      this.startGame();
    }
  };

  ngAfterViewInit(): void {
    window.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.keydownHandler);
  }

  startGame() {
    this.gameService.startGame();
  }
}
