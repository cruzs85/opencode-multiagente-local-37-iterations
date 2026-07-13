import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { GameService } from './game.service';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { initialState } from './game.state';

describe('App', () => {
  let mockGameService: any;

  beforeEach(async () => {
    // Crear un mock completo del GameService
    mockGameService = {
      state: signal(initialState),
      highScore: signal(0),
      startGame: vi.fn(),
      gameOver: vi.fn(),
      stopLoop: vi.fn(),
      resetGame: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should display WelcomeComponent by default (screen = welcome)', () => {
    // Reiniciar el estado a welcome
    mockGameService.state.set({ ...initialState, screen: 'welcome' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Verificar que el componente de bienvenida se muestra
    expect(compiled.querySelector('app-welcome')).toBeTruthy();
  });

  it('should display GameComponent when startGame is called (screen = playing)', () => {
    // Establecer el estado a playing
    mockGameService.state.set({ ...initialState, screen: 'playing' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-game')).toBeTruthy();
  });

  it('should display GameOverComponent when gameOver is called (screen = gameover)', () => {
    // Establecer el estado a gameover
    mockGameService.state.set({ ...initialState, screen: 'gameover' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-game-over')).toBeTruthy();
  });
});
