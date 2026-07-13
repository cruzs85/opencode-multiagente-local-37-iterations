import { Component, inject } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  template: `
    <div class="welcome-container">
      <h1 class="welcome-title neon-glow-cyan">DINOSAUR RUNNER</h1>
      
      <div class="instructions">
        <h2 class="instructions-title">INSTRUCCIONES</h2>
        <ul class="instructions-list">
          <li>Presiona ESPACIO o CLICK para saltar</li>
          <li>Salto doble disponible en el aire</li>
          <li>La velocidad aumenta con el tiempo</li>
          <li>Evita los obstáculos</li>
        </ul>
      </div>
      
      <div class="high-score">
        <span class="score-label">RÉCORD:</span>
        <span class="score-value neon-glow-yellow">{{ gameService.highScore() }}</span>
      </div>
      
      <button class="play-button neon-border-cyan" (click)="startGame()">
        JUGAR
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #0a0a0f;
      font-family: 'Press Start 2P', monospace;
    }
    
    .welcome-container {
      text-align: center;
      padding: 2rem;
      background-color: #14141f;
      border-radius: 10px;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
      border: 1px solid #00f0ff;
      max-width: 90%;
      width: 500px;
    }
    
    .welcome-title {
      color: #00f0ff;
      text-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff, 0 0 30px #00f0ff;
      margin-bottom: 2rem;
      font-size: 1.8rem;
      letter-spacing: 2px;
    }
    
    .instructions {
      margin-bottom: 2rem;
    }
    
    .instructions-title {
      color: #00f0ff;
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    .instructions-list {
      color: #f0f0f0;
      text-align: left;
      padding-left: 1rem;
      margin: 0;
    }
    
    .instructions-list li {
      margin-bottom: 0.5rem;
      font-size: 0.7rem;
    }
    
    .high-score {
      margin-bottom: 2rem;
    }
    
    .score-label {
      color: #a0a0b0;
      font-size: 0.8rem;
    }
    
    .score-value {
      color: #ffe600;
      font-size: 1.2rem;
      text-shadow: 0 0 10px #ffe600, 0 0 20px #ffe600;
      margin-left: 0.5rem;
    }
    
    .play-button {
      background-color: #1e1e32;
      color: #00f0ff;
      border: 2px solid #00f0ff;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-family: 'Press Start 2P', monospace;
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .play-button:hover {
      background-color: #2a2a45;
      border-color: #ff00aa;
      box-shadow: 0 0 15px rgba(255, 0, 170, 0.5);
      color: #ff00aa;
      text-shadow: 0 0 10px #ff00aa;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .welcome-container {
      animation: fadeIn 1s ease-in;
    }
  `
})
export class WelcomeComponent {
  gameService = inject(GameService);

  startGame(): void {
    this.gameService.startGame();
  }
}