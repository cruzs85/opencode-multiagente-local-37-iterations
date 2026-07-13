import { Component, output } from '@angular/core';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  templateUrl: './welcome-screen.html',
  styleUrl: './welcome-screen.scss'
})
export class WelcomeScreen {
  readonly startGame = output<void>();

  onStart(): void {
    this.startGame.emit();
  }
}
