import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-cactus',
  standalone: true,
  template: `
    <div class="cactus">
      <div class="cactus-stem"></div>
      <div class="cactus-arm cactus-arm--left"></div>
      <div class="cactus-arm cactus-arm--right"></div>
    </div>
  `,
  styleUrls: ['./cactus.component.scss']
})
export class CactusComponent {
  constructor() {
    // Constructor vacío para componentes standalone
  }
}