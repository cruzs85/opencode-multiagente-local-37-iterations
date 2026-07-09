import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighScoreService } from '../services/high-score.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  highScoreService = inject(HighScoreService);

  showHighScore() {
    // Este método ya no es necesario, el high score se muestra directamente en la plantilla
  }
}