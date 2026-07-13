import { Component } from '@angular/core';

@Component({
  selector: 'app-dino',
  standalone: true,
  template: `
    <div class="dino">
      <div class="dino-body"></div>
      <div class="dino-leg dino-leg--front"></div>
      <div class="dino-leg dino-leg--back"></div>
      <div class="dino-eye"></div>
    </div>
  `,
  styleUrls: ['./dino.component.scss']
})
export class DinoComponent {
  constructor() {
    // Constructor vacío para componentes standalone
  }
}