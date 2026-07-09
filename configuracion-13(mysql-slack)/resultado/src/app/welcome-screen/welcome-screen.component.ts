import { Component, inject } from '@angular/core';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [],
  templateUrl: './welcome-screen.component.html',
  styleUrl: './welcome-screen.component.scss'
})
export class WelcomeScreenComponent {
  private gameService = inject(GameService)

  // Propiedad pública que expone el highScore como signal readonly
  readonly highScore = this.gameService.highScore

  // Método startGame(): llama a gameService.startGame()
  startGame(): void {
    this.gameService.startGame();
  }
}
