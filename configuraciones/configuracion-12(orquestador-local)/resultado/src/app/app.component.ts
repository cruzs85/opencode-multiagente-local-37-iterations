import { Component } from '@angular/core';
import { GameComponent } from './game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GameComponent],
  template: `
    <main>
      <app-game />
    </main>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      background-color: #f0f0f0;
    }
  `]
})
export class AppComponent {
  title = 'dino-runner';
}