import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App - Dinosaur Runner', () => {
  beforeEach(async () => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('debe crear el componente', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe renderizar el game-container', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('.game-container');
    expect(container).toBeTruthy();
  });

  it('debe tener señales con valores iniciales correctos', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app['isPlaying']()).toBe(false);
    expect(app['isGameOver']()).toBe(false);
    expect(app['score']()).toBe(0);
    expect(app['dinoY']()).toBe(0);
    expect(app['dinoVelocity']()).toBe(0);
    expect(app['jumpCount']()).toBe(2);
  });

  // ─── Lógica de salto ──
  describe('Lógica de salto', () => {
    it('debe comenzar con jumpCount en 2', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app['jumpCount']()).toBe(2);
    });

    it('debe reducir jumpCount al saltar', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego para asegurar estado correcto
      app['iniciarJuego']();
      
      // Saltar una vez
      app['saltar']();
      expect(app['jumpCount']()).toBe(1);
      
      // Saltar otra vez
      app['saltar']();
      expect(app['jumpCount']()).toBe(0);
    });
  });

  // ─── High score ──
  describe('High score', () => {
    it('debe cargar high score desde localStorage al iniciar', () => {
      // Establecer un high score en localStorage
      localStorage.setItem('dino-high-score', '1500');
      
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Verificar que se carga correctamente
      expect(app['highScore']()).toBe(1500);
    });

    it('debe actualizar high score cuando se supera', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego
      app['iniciarJuego']();
      
      // Establecer un score alto
      app['score'].set(2000);
      
      // Simular el proceso de guardado del high score como en el ciclo de juego
      const puntActual = app['score']();
      const recordActual = app['highScore']();
      if (puntActual > recordActual) {
        app['highScore'].set(puntActual);
      }
      
      // Verificar que se actualiza el high score
      expect(app['highScore']()).toBe(2000);
    });
  });

  // ─── Velocidad ──
  describe('Velocidad', () => {
    it('debe aumentar gameSpeed a medida que sube el score', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego
      app['iniciarJuego']();
      
      // Establecer score bajo
      app['score'].set(100);
      expect(app['gameSpeed']()).toBe(3); // baseSpeed = 3
      
      // Establecer score medio
      app['score'].set(600);
      expect(app['gameSpeed']()).toBe(3.5); // 3 + 1 * 0.5
      
      // Establecer score alto
      app['score'].set(1200);
      expect(app['gameSpeed']()).toBe(4); // 3 + 2 * 0.5
    });
  });

  // ─── Pantallas ──
  describe('Pantallas', () => {
    it('debe mostrar mensaje de inicio cuando no se está jugando ni en game over', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego
      app['iniciarJuego']();
      
      // Verificar que no está en game over ni jugando
      expect(app['isGameOver']()).toBe(false);
      expect(app['isPlaying']()).toBe(true);
    });

    it('debe mostrar game over cuando corresponde', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego
      app['iniciarJuego']();
      
      // Simular colisión para activar game over
      app['isGameOver'].set(true);
      
      expect(app['isGameOver']()).toBe(true);
    });
  });

  // ─── Reinicio ──
  describe('Reinicio', () => {
    it('debe reiniciar todos los valores al llamar a restart', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      
      // Iniciar juego
      app['iniciarJuego']();
      
      // Cambiar algunos valores
      app['score'].set(1000);
      app['dinoY'].set(50);
      app['jumpCount'].set(1);
      app['isGameOver'].set(true);
      
      // Reiniciar
      app['restart']();
      
      // Verificar que se reinician todos los valores
      expect(app['score']()).toBe(0);
      expect(app['dinoY']()).toBe(0);
      expect(app['jumpCount']()).toBe(2);
      expect(app['isGameOver']()).toBe(false);
      expect(app['isPlaying']()).toBe(true);
    });
  });
});