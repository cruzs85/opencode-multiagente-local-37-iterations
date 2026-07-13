import { Component, inject } from '@angular/core';
import { ScreenStateService, Screen } from './services/screen-state.service';
import { WelcomeComponent } from './welcome/welcome';
import { GameComponent } from './game/game';
import { GameoverComponent } from './gameover/gameover';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WelcomeComponent, GameComponent, GameoverComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly screenState = inject(ScreenStateService);
  protected readonly Screen = Screen;

  constructor() {
    console.log('[DIAG] AppComponent loaded');
    window.addEventListener('error', (e) => {
      console.error('[DIAG] Global error:', e.message);
    });
  }
}
