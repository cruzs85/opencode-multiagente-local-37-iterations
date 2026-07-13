import { Component, signal, inject } from '@angular/core';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { GameComponent } from './pages/game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, GameComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly _showWelcome = signal<boolean>(true);
  readonly showWelcome = this._showWelcome.asReadonly();

  onStartGame(): void {
    this._showWelcome.set(false);
  }

  onBackToWelcome(): void {
    this._showWelcome.set(true);
  }
}
