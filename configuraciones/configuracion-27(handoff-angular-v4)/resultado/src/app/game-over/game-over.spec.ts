import { TestBed } from '@angular/core/testing';
import { GameOver } from './game-over';

describe('GameOver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameOver]
    });
  });

  it('should create', () => {
    const component = TestBed.createComponent(GameOver);
    expect(component).toBeTruthy();
  });
});