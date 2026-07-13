import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { GameEngineService } from './core/services/game-engine.service';

describe('App', () => {
  beforeEach(async () => {
    // Mock localStorage for GameEngineService -> ScoreService
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should start game when onStartGame is called', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const gameEngine = TestBed.inject(GameEngineService);
    const startGameSpy = vi.spyOn(gameEngine, 'startGame');
    app.onStartGame();
    expect(startGameSpy).toHaveBeenCalled();
  });

  it('should show welcome screen initially', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Debería mostrar el título del juego en la pantalla de bienvenida
    expect(compiled.textContent).toContain('Dino Runner');
  });
});
