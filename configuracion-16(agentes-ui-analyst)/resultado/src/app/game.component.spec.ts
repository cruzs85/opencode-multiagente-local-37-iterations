import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from './game.service';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [GameService]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener gamePhase inicial welcome desde GameService', () => {
    expect((component as any).gamePhase()).toBe('welcome');
  });

  it('debe tener score inicial 0', () => {
    expect((component as any).score()).toBe(0);
  });

  it('debe exponer highScore desde GameService', () => {
    expect((component as any).highScore()).toBe(0);
  });

  it('debe mostrar welcome overlay cuando gamePhase es welcome', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.game-title')).toBeTruthy();
  });

  it('debe ocultar welcome overlay cuando el juego empieza', () => {
    gameService.startGame();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.game-title')).toBeFalsy();
  });

  it('debe mostrar canvas cuando el juego esta en playing', () => {
    gameService.startGame();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const canvas = el.querySelector('canvas.game-canvas');
    expect(canvas).toBeTruthy();
  });

  it('debe actualizar score cuando gameService cambia', () => {
    gameService.startGame();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const scoreEl = el.querySelector('.score');
    expect(scoreEl).toBeTruthy();
    expect(scoreEl?.textContent).toContain('Score: 0');
  });
})
