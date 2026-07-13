---
name: angular-patterns
description: Reglas estrictas de codigo Angular (componentes, tests, eventos, signals)
---

# Reglas Estrictas de Angular

## Pre-escritura (OBLIGATORIO - evitar errores comunes)
- **No inventes imports**: `find src/app -type f -name "*.service.ts"` (o mismo patrón para *.component.ts, *.ts) para LOCALIZAR el archivo antes de importar. NO adivines la ruta.
- **No inventes nombres de API**: Antes de usar un servicio, LEE el archivo .ts completo. Copia nombres EXACTOS de propiedades y métodos.
- **No dupliques**: Antes de crear un archivo, verifica con glob/find que no exista ya. Si existe, MODIFICALO.
- **No inventes propiedades en templates**: Antes de usar `obstacle.y` en HTML, verifica que `y` exista en la interfaz `Obstacle`.

## Componentes standalone
- `RouterOutlet`: app.ts DEBE importar `RouterOutlet` de `@angular/router` e incluirlo en `imports: []`
- `@ViewChild` (no `document.querySelector`):
  ```typescript
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  ```
  NO usar `document.querySelector('canvas')!` ni `document.getElementById('gameCanvas')!`
- `inject()` (no constructor DI): Usar `router = inject(Router)` en vez de `constructor(private router: Router)`. Esto aplica a componentes, servicios y cualquier clase injectable.
- `styleUrl` (singular), no `styleUrls` (plural)

## Angular 21 API Differences (CRITICAL - violar causa errores)
- `effect()` SOLO en el constructor o field initializer. NUNCA en ngOnInit ni métodos.
  ```typescript
  // CORRECTO:
  export class GameComponent {
    private gameService = inject(GameService);
    private effectRef = effect(() => { /* ... */ });
  }
  
  // INCORRECTO:
  export class GameComponent {
    ngOnInit() {
      effect(() => { /* ... */ }); // NG0203!
    }
  }
  ```
- `ActivatedRoute.queryParams` es un `input()` signal en Angular 21. NO usar `.subscribe()`.
  ```typescript
  // CORRECTO:
  this.route.snapshot.queryParams['param']
  
  // INCORRECTO:
  this.route.queryParams.subscribe(params => ...); // TypeError!
  ```
- `@if/@for/@switch` en templates. NUNCA `*ngIf/*ngFor/*ngSwitch`, `*if`, `*for` ni `*switch`. La única sintaxis válida es `@`, no `*`.
  ```typescript
  // CORRECTO:
  @for (item of items; track item.id) { ... }
  @if (condicion) { ... }
  @switch (condicion) { @case (x) { ... } }
  
  // INCORRECTO:
  *ngFor="let item of items" // Error: no es directiva conocida
  *for="let item of items"  // NG8116
  *if="condicion"           // NG8116 — NO existe en Angular
  *switch="condicion"       // NG8116 — NO existe en Angular
  ```
- `provideZonelessChangeDetection()` (sin "Experimental"). Angular 21 eliminó el prefijo.
  ```typescript
  // CORRECTO:
  import { provideZonelessChangeDetection } from '@angular/core';
  
  // INCORRECTO:
  import { provideExperimentalZonelessChangeDetection } from '@angular/core'; // No existe
  ```
- `template` y `styles` INLINE para compatibilidad con Vitest JIT. NUNCA `templateUrl`/`styleUrls`.
- `inject()` (no constructor DI): Usar `router = inject(Router)` en vez de `constructor(private router: Router)`.
- Mocks: `vi.fn()` de Vitest. NUNCA `jasmine.createSpyObj` ni `jasmine.createSpy`.

## Signals
- Llamar signals con `()` en templates y TypeScript:
  - Template: `{{ miSignal() }}`, no `{{ miSignal }}`
  - TS: `this.gameService.score()`, no `this.gameService.score`
- Signals expuestos publicamente como `readonly signal` o metodos que retornan el valor
- Signal se crea con `signal(valorInicial)`, NO con `new Signal()`. `Signal` no es un constructor.
- Para eventos/notificaciones (gameOver, colisiones, etc.), usar `Subject` de rxjs o `output()` de Angular, NO signals.
  ```typescript
  // Correcto para notificaciones:
  private gameOverSubject = new Subject<void>();
  gameOver$ = this.gameOverSubject.asObservable();
  
  // Incorrecto:
  // gameOver$ = new Signal<() => void>();  // !NO EXISTE!
  ```

## API de servicios y alcance entre componentes
- **Métodos que el componente necesita DEBEN ser públicos**: si un servicio tiene un bucle (requestAnimationFrame, setInterval, etc.), expón `start()`/`stop()` públicos. No marques como `private` algo que el componente debe llamar en `ngOnInit`/`ngOnDestroy`.
- **NO modifiques archivos fuera del alcance de tu tarea**: si encuentras que necesitas editar un archivo existente que no está listado en "Archivos a crear/modificar" de tu tarea, REPORTA la necesidad. No lo edites. El orquestador decidirá si corresponde.

## Event listeners
- Guardar referencias bind para poder removerlos:
  ```typescript
  private boundKeyDown = this.handleKeyDown.bind(this);
  // addEventListener('keydown', this.boundKeyDown);
  // removeEventListener('keydown', this.boundKeyDown);
  ```
  NO usar `.bind(this)` inline en addEventListener (crea nueva referencia cada vez, no se puede limpiar)

## Tests con Vitest
- Ejecutar tests con `ng test --watch=false` (NO `npx vitest run` directamente). El builder @angular/build:unit-test maneja la configuracion de Vitest.
- NO crear `vitest.config.ts` ni `test-setup.ts` manualmente. El builder genera init-testbed.js automaticamente.
- Usar `vi.fn()` para mocks, NO `jest.fn()` ni `jasmine.createSpy()`
- Usar `describe`, `it`, `expect` de Vitest (son globales con `globals: true`)
- Para mocks de localStorage, usar `Object.defineProperty(window, 'localStorage', { value: {...}, writable: true })`
- Mock de signals: NO usar `vi.fn()` para properties que son signals. Usar `signal(valor)`:
  ```typescript
  // CORRECTO:
  const mockService = {
    score: signal(0) as unknown as ReturnType<typeof signal>,
    highScore: signal(100),
    gameOver: signal(false),
    gameState: signal<GameState>('idle'),
    jump: vi.fn(),
    update: vi.fn(),
  };
  providers: [{ provide: DinoGameService, useValue: mockService }]
  
  // INCORRECTO:
  score: vi.fn().mockReturnValue(0)  // No es un signal
  ```
- Mock completo: el mock debe incluir TODOS los métodos que el componente llama, incluso los que no pruebas directamente. Ej: si `ngOnDestroy` llama a `stopLoop`, incluye `stopLoop: vi.fn()` — Angular lo ejecuta al destruir el fixture.
- Objeto de estado (`state()`) completo: usa spread de `initialState` para no omitir propiedades:
  ```typescript
  // CORRECTO:
  import { initialState } from '...';
  mockService.state.mockReturnValue({
    ...initialState,
    score: 100,
    screen: 'playing'
  });

  // INCORRECTO: falta speed, dinoY, etc → crash en toFixed(), translateY()
  mockService.state.mockReturnValue({ score: 100, screen: 'playing' });
  ```
- Setea `state()` y `highScore()` ANTES de `fixture.detectChanges()`. Si solo seteas `highScore` y no `state()`, el template falla al leer `state().score`.
- Componentes con `inject(Servicio)` SIN `providedIn: 'root'`: deben proveerse en TestBed.providers. Si el servicio tiene `providedIn: 'root'`, igual es buena practica mockearlo en providers.

### Espías con Vitest (NO Jasmine)
- `vi.spyOn(objeto, 'metodo')`, NO `spyOn(objeto, 'metodo')` (Jasmine). `spyOn` no existe en Vitest.
- Métodos privados (`private metodo()`): NO se puede espiar con `vi.spyOn`. Alternativas:
  ```typescript
  // (a) Testear a través del método público que lo llama
  service.gameOver();
  expect(service['highScore']()).toBe(100);

  // (b) Llamar directamente con bracket notation
  service['checkCollisions']();

  // (c) Forzar con ts-expect-error (solo si necesario)
  // @ts-expect-error - método privado
  vi.spyOn(service as any, 'gameOver');
  ```
- `vi.fn()`, NO `jasmine.createSpy()` ni `jasmine.createSpyObj()`

### localStorage en tests
```typescript
const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

service.gameOver();
expect(setItemSpy).toHaveBeenCalledWith('dino-high-score', '100');

// Limpiar al final
getItemSpy.mockRestore();
```
NO usar `Object.defineProperty(window, 'localStorage', {...})` — es frágil y falla si el servicio se instancia antes del mock. `vi.spyOn(Storage.prototype, ...)` es más robusto. Si ya se instanció el servicio, usar `mockReturnValue`.

### clear/mockRestore
- `vi.clearAllMocks()` en `afterEach` para limpiar calls entre tests
- `vi.restoreAllMocks()` para restaurar implementaciones originales
- NO usar `jest.clearAllMocks()` (Jest API)

## Tests E2E con Playwright
- **Lee el HTML antes de escribir selectores**: usa `read` para ver el template del componente. Copia clases, IDs y texto EXACTOS. No inventes selectores.
  ```typescript
  // CORRECTO (basado en HTML real):
  await expect(page.locator('h1.welcome-title')).toContainText('DINOSAUR RUNNER');
  await expect(page.locator('button.play-button')).toBeVisible();

  // INCORRECTO (inventado):
  await expect(page.locator('#high-score')).toContainText('0');  // No existe ese ID
  await expect(page.locator('button:has-text("Play")')).toBeVisible();  // Texto no coincide
  ```
- **Game Over**: no esperes colisión natural. Usa `page.evaluate()` para forzar el estado:
  ```typescript
  await page.evaluate(() => {
    const state = (document.querySelector('.game-container') as any)?.__ngContext__;
    // o directamente modificar localStorage y recargar
  });
  ```
- **Múltiples elementos con misma clase**: usa `.first()`, `.nth(0)` o selectores más específicos:
  ```typescript
  const scoreValue = page.locator('.score .score-value');  // Especificidad por padre
  const highScoreValue = page.locator('.high-score .score-value');
  ```
- **Timeout del webServer**: en `playwright.config.ts`, usa `timeout: 120000` si el dev server tarda en arrancar.
- **localStorage en E2E**: se debe setear ANTES de navegar, o usar `page.evaluate()` después de cargar la página:
  ```typescript
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('dino-high-score', '100'));
  await page.reload();
  ```
- **Textos en español**: los componentes están en español. Usa textos reales ("Puntuación:", "Récord:", "Reintentar") no traducciones inventadas.

## Archivos que NO deben borrarse sin orden explicita
- `src/app/app.ts`
- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/main.ts`
- NO borrar toda la carpeta `src/app/` para "empezar de nuevo". Corregir errores especificos en su lugar.
