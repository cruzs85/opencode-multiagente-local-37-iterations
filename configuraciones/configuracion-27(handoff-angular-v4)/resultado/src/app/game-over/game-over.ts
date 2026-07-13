import { Component, signal, DestroyRef, afterNextRender } from '@angular/core';
import { input, output } from '@angular/core';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [],
  templateUrl: './game-over.html',
  styleUrl: './game-over.scss'
})
export class GameOver {
  readonly score = input.required<number>();
  
  readonly retry = output<void>();
  readonly menu = output<void>();
  
  private storage = inject(StorageService);
  protected readonly isNewRecord = signal(false);
  
  constructor() {
    afterNextRender(() => {
      const currentRecord = this.storage.getHighScore();
      this.isNewRecord.set(this.score() > currentRecord);
      if (this.isNewRecord()) {
        this.storage.setHighScore(this.score());
      }
    });
  }
}