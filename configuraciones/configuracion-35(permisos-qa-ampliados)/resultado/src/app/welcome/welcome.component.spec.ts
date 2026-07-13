import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    const title = fixture.debugElement.query(By.css('h1.title'));
    expect(title.nativeElement.textContent).toBe('DINO RUNNER');
  });

  it('should have the correct subtitle', () => {
    const subtitle = fixture.debugElement.query(By.css('p.subtitle'));
    expect(subtitle.nativeElement.textContent).toBe('Chrome-style endless runner');
  });

  it('should have a start button', () => {
    const button = fixture.debugElement.query(By.css('button.start-button'));
    expect(button).toBeTruthy();
    expect(button.nativeElement.textContent).toBe('START GAME');
  });
});
