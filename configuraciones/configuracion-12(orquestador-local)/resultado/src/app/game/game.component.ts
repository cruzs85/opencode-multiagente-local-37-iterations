import { Component, inject } from '@angular/core';
import { DinoComponent } from '../dino/dino.component';
import { CactusComponent } from '../cactus/cactus.component';
import { GroundComponent } from '../ground/ground.component';
import { ScoreDisplayComponent } from '../score-display/score-display.component';
import { GameService } from '../../app/game.service';
import { GameControlComponent } from '../game-control/game-control.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    DinoComponent,
    CactusComponent,
    GroundComponent,
    ScoreDisplayComponent,
    GameControlComponent
  ],
  template: `
    <div class="game-container">
      <app-game-control />
      <div class="game-area">
        <app-dino />
        <app-cactus />
        <app-ground />
      </div>
    </div>
  `,
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  private gameService = inject(GameService);

  constructor() {
    // Constructor vacío para componentes standalone
  }
}