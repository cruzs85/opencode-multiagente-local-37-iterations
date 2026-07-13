import { Component, output } from '@angular/core';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  readonly startGame = output<void>();

  onStartClick(): void {
    this.startGame.emit();
  }
}