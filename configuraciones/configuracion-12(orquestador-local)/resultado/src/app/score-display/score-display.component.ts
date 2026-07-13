import { Component } from '@angular/core';

@Component({
  selector: 'app-score-display',
  standalone: true,
  template: `
    <div class="score-display">
      <span class="score-value">0</span>
    </div>
  `,
  styleUrls: ['./score-display.component.scss']
})
export class ScoreDisplayComponent {
  constructor() {
    // Constructor vacío para componentes standalone
  }
}