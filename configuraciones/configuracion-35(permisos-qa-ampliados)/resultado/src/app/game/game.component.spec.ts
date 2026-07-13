import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { GameComponent } from './game.component';
import { GameService } from '../services/game.service';
import { vi } from 'vitest';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let mockGameService: any;

  beforeEach(async () => {
    mockGameService = {
      gameStateSignal: vi.fn().mockReturnValue('playing'),
      scoreSignal: vi.fn().mockReturnValue(0),
      dinoYSignal: vi.fn().mockReturnValue(310),
      obstaclesSignal: vi.fn().mockReturnValue([]),
      start: vi.fn(),
      jump: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a canvas element', () => {
    const canvas = fixture.debugElement.query(By.css('canvas'));
    expect(canvas).toBeTruthy();
  });

  it('should call gameService.start on init', () => {
    expect(mockGameService.start).toHaveBeenCalled();
  });

  it('should handle keydown events', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    component.handleKeyDown(event);
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should call jump when spacebar is pressed', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    component.handleKeyDown(event);
    expect(mockGameService.jump).toHaveBeenCalled();
  });

  it('should call jump when up arrow is pressed', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.handleKeyDown(event);
    expect(mockGameService.jump).toHaveBeenCalled();
  });
});
