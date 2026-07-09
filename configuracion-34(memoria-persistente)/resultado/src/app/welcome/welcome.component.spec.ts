import { TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { provideRouter } from '@angular/router';

describe('WelcomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        provideRouter([]),
      ]
    }).compileComponents();

    // Crear el componente y detectar cambios
    const fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render title DINO RUNNER', () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.welcome-title').textContent).toContain('DINO RUNNER');
  });

  it('should render game instructions', () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.game-instructions')).toBeTruthy();
  });

  it('should render play button', () => {
    const fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.play-button')).toBeTruthy();
  });
});
