import { Component } from '@angular/core';

@Component({
  selector: 'app-ground',
  standalone: true,
  template: `
    <div class="ground">
      <div class="ground-surface"></div>
      <div class="ground-decoration"></div>
    </div>
  `,
  styleUrls: ['./ground.component.scss']
})
export class GroundComponent {
  constructor() {
    // Constructor vacío para componentes standalone
  }
}