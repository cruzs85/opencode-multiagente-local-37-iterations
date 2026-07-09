import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { GameService } from '../game.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let mockGameService: any;

  beforeEach(() => {
    mockGameService = {
      highScore: signal(1000),
      startGame: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        { provide: GameService, useValue: mockGameService }
      ]
    });

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render welcome title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.welcome-title').textContent).toContain('DINOSAUR RUNNER');
  });

  it('should display high score', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.score-value').textContent).toContain('1000');
  });

  it('should call startGame when button is clicked', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.play-button');
    
    button.click();
    
    expect(mockGameService.startGame).toHaveBeenCalled();
  });
});