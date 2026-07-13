import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getHighScore(): number {
    const score = localStorage.getItem('dinoHighScore');
    return score ? parseInt(score, 10) : 0;
  }

  setHighScore(score: number): void {
    localStorage.setItem('dinoHighScore', score.toString());
  }
}