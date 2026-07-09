import { Injectable, signal } from '@angular/core';
import { HIGH_SCORE_KEY } from '../models/game.types';

/**
 * Servicio para gestionar el récord de puntuación del juego.
 * Almacena y recupera el récord usando localStorage.
 */
@Injectable({ providedIn: 'root' })
export class HighScoreService {
  private readonly STORAGE_KEY = 'dino-runner-high-score';
  private readonly _highScore = signal<number>(0);

  /**
   * Señal pública de solo lectura que expone el récord actual.
   */
  readonly highScore = this._highScore.asReadonly();

  constructor() {
    this.loadHighScore();
  }

  /**
   * Carga el récord desde localStorage.
   * Si no existe o no es válido, usa 0 como valor predeterminado.
   */
  loadHighScore(): void {
    try {
      const storedScore = localStorage.getItem(this.STORAGE_KEY);
      const score = storedScore ? parseInt(storedScore, 10) : 0;
      this._highScore.set(isNaN(score) ? 0 : score);
    } catch (error) {
      console.error('Error al cargar el récord:', error);
      this._highScore.set(0);
    }
  }

  /**
   * Guarda el récord en localStorage.
   * @param score La puntuación a guardar
   */
  saveHighScore(score: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, score.toString());
      this._highScore.set(score);
    } catch (error) {
      console.error('Error al guardar el récord:', error);
    }
  }

  /**
   * Actualiza el récord si la puntuación actual es mayor.
   * @param currentScore La puntuación actual del juego
   */
  updateIfHigher(currentScore: number): void {
    if (currentScore > this._highScore()) {
      this.saveHighScore(currentScore);
    }
  }

  /**
   * Reinicia el récord a 0 y lo borra de localStorage.
   */
  resetHighScore(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error al borrar el récord:', error);
    }
    this._highScore.set(0);
  }
}