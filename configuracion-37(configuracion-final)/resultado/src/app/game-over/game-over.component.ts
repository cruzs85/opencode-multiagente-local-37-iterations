import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.scss'
})
export class GameOverComponent {
  gameService = inject(GameService);
  router = inject(Router);
}