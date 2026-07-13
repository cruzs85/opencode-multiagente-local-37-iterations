import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
  start = output<void>();
  highScore = signal<number>(0);

  constructor() {
    const saved = localStorage.getItem('dinoHighScore');
    if (saved) { this.highScore.set(parseInt(saved, 10)); }
  }

  onStart() { this.start.emit(); }
}