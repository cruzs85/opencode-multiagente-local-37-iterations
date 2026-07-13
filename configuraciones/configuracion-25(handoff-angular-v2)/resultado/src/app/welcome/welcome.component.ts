import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  template: `
    <div class="welcome-container" [class.fade-out]="isFading()">
      <h1 class="title">DINO RUN</h1>
      <p class="subtitle">El clásico juego del dinosaurio</p>
      <div class="instructions">
        <div class="instruction-item">🚀 Pulsa ESPACIO para saltar</div>
        <div class="instruction-item">🚀🚀 Doble salto permitido</div>
        <div class="instruction-item">⚠️ Esquiva los obstáculos</div>
        <div class="instruction-item">📈 La velocidad aumenta con el tiempo</div>
      </div>
      <button class="start-button" (click)="startGame()">INICIAR JUEGO</button>
    </div>
  `,
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  isFading = signal(false);

  private router = inject(Router);

  startGame() {
    this.isFading.set(true);
    this.router.navigate(['/game']);
  }
}
