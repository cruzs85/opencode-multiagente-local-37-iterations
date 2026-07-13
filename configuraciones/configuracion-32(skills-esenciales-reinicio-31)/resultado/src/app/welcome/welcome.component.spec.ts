import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { RouterLink } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeComponent, RouterLink],
      providers: [provideRouter([]), provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title DINO RUNNER', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.welcome-title') as HTMLElement;
    expect(title).toBeTruthy();
    expect(title.textContent?.trim()).toBe('DINO RUNNER');
  });

  it('should render play button with routerLink to /game', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const playButton = compiled.querySelector('a.btn-play') as HTMLAnchorElement;
    expect(playButton).toBeTruthy();
    expect(playButton.getAttribute('routerLink')).toBe('/game');
  });

  it('should render instructions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const instructions = compiled.querySelector('.welcome-instructions') as HTMLElement;
    expect(instructions).toBeTruthy();
    
    const paragraphs = instructions.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0].textContent?.trim()).toBe('Presiona la barra espaciadora o haz clic para saltar.');
    expect(paragraphs[1].textContent?.trim()).toBe('Puedes saltar una segunda vez en el aire.');
    expect(paragraphs[2].textContent?.trim()).toBe('Esquiva los obstáculos y supera tu récord.');
  });
});
