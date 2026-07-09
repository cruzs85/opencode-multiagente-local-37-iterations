import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from './services/game.service';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [GameService],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    const gameService = TestBed.inject(GameService);
    gameService.cancelGameLoop();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a canvas element', () => {
    expect(component.canvasRef).toBeTruthy();
  });

  it('should render canvas in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const canvas = compiled.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('should draw start screen when game not started', () => {
    const gameService = TestBed.inject(GameService);
    const state = gameService.gameState();
    expect(state.isStarted).toBe(false);
    const canvas = component.canvasRef();
    expect(canvas).toBeTruthy();
  });
});
