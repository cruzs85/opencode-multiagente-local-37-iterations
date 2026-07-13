---
name: angular-patterns
description: Reglas estrictas de codigo Angular 21 (componentes, tests, eventos, signals, estructura)
---

# Reglas Estrictas de Angular 21

## Convencion de Nombrado
- Cada componente standalone en su subcarpeta `src/app/[kebab-case]/`
- Archivos: `[kebab-case].component.ts`, `.html`, `.scss`, `.spec.ts`
- Clase: `PascalCase + Component` (ej: `WelcomeComponent`, `GameComponent`)
- Servicios: `src/app/services/[kebab-case].service.ts`, clase `PascalCaseService`

## Angular 21 Defaults (NO CAMBIAR)
| Aspecto | Default | Notas |
|---------|---------|-------|
| Test runner | **Vitest** (no Karma/Jasmine) | `describe/it/expect` globales |
| Change detection | **Zoneless** | `provideZonelessChangeDetection()` |
| Build system | `@angular/build` (application builder) | Config en angular.json |
| Componentes | Standalone | Sin NgModules |
| HttpClient | `provideHttpClient(withFetch())` | Global en app.config |

## Pre-escritura (OBLIGATORIO)
- Antes de importar, usa `find /ruta/completa/proyecto/src/app` para LOCALIZAR el archivo real con RUTA ABSOLUTA. NO adivines rutas.
- Antes de usar propiedades de un servicio, LEE el archivo completo. NO inventes nombres.
- Antes de crear un archivo, verifica con `glob` que no exista ya. Si existe, MODIFICALO.
- Verifica el directorio actual con `pwd` ANTES de cualquier operacion de ruta.

## Componentes standalone
- `RouterOutlet`: `imports: [RouterOutlet]` en app.ts
- `@ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>` — NO `document.querySelector`
- `inject()` en vez de constructor DI: `servicio = inject(MiServicio)`
- `styleUrl` (singular), NO `styleUrls`
- `template` y `styles` inline para compatibilidad con Vitest JIT

## Angular 21 API (CRITICAL)
- `effect()` SOLO en constructor o field initializer, NUNCA en ngOnInit
  ```typescript
  // CORRECTO: private effectRef = effect(() => { ... });
  // INCORRECTO: ngOnInit() { effect(() => { ... }); } // NG0203!
  ```
- `ActivatedRoute.queryParams` es `input()` signal. NO usar `.subscribe()`.
  ```typescript
  // CORRECTO: this.route.snapshot.queryParams['param']
  ```
- `@if/@for/@switch` — NUNCA `*ngIf/*ngFor/*ngSwitch`
- `provideZonelessChangeDetection()` — SIN prefijo "Experimental"
- Mocks: `vi.fn()` de Vitest. NUNCA `jasmine.createSpyObj`

## Signals
- Llamar con `()` en templates y TS: `{{ miSignal() }}`, `this.servicio.score()`
- Signals expuestos como `readonly signal<>` o metodos que retornan valor
- Crear con `signal(valorInicial)`, NO `new Signal()`
- Para notificaciones (gameOver, colisiones): usar `Subject` de rxjs, NO signals

## Event listeners
- Guardar referencias bind: `private boundKeyDown = this.handleKeyDown.bind(this)`
- NO usar `.bind(this)` inline en addEventListener

## Tipos de Colision (AABB)
```typescript
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
function checkCollision(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
         a.y < b.y + b.height && a.y + a.height > b.y;
}
```

## Canvas Mock para Tests
```typescript
const mockCtx = {
  canvas: { width: 800, height: 200 },
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  requestAnimationFrame: vi.fn(),
  closePath: vi.fn(),
  shadowBlur: 0,
  shadowColor: '',
  fillStyle: '',
  strokeStyle: '',
  font: '',
  textAlign: '',
};
vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
  .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D);
```

## Tests Unitarios (Vitest)
- Ejecutar: `npm run test -- --watch=false` (NO `npx vitest run`)
- NO crear `vitest.config.ts` ni `test-setup.ts`. El builder @angular/build:unit-test maneja todo.
- NO instalar `@angular/platform-browser-dynamic` (causa conflictos).

### REGLAS CRITICAS - Vitest NO es Jasmine
| Prohibido (Jasmine) | Correcto (Vitest) |
|---|---|
| `jasmine.createSpyObj(...)` | `{ metodo: vi.fn() }` |
| `spyOn(obj, 'metodo').and.returnValue(x)` | `vi.spyOn(obj, 'metodo').mockReturnValue(x)` |
| `spyOn(component, 'metodo')` | `vi.spyOn(component, 'metodo')` |
| `expect(spy).toHaveBeenCalledWith(x)` | `expect(spy).toHaveBeenCalledWith(x)` (igual, OK) |

### Mock de localStorage (ERROR COMUN)
**INCORRECTO** (no funciona en jsdom):
```typescript
vi.spyOn(localStorage, 'getItem')  // ❌ No espía el getItem real de jsdom
```

**CORRECTO** (espía el prototipo):
```typescript
vi.spyOn(Storage.prototype, 'getItem')  // ✅ Funciona siempre
vi.spyOn(Storage.prototype, 'setItem')  // ✅ Funciona siempre
```

Ejemplo completo de test con localStorage:
```typescript
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HighScoreService } from './high-score.service';

describe('HighScoreService', () => {
  let service: HighScoreService;

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem');
    TestBed.configureTestingModule({});
    service = TestBed.inject(HighScoreService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads from localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('100');
    const s = TestBed.inject(HighScoreService);
    expect(s.highScore()).toBe(100);
  });

  it('saves to localStorage', () => {
    service.saveScore(200);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('key', '200');
  });
});
```

### Mock de Signals en Servicios
- **Si el template usa `service.signalName()`** → el mock debe tener `signalName` como función:
  ```typescript
  // Template: {{ gameService.score() }}
  const mockService = {
    score: vi.fn().mockReturnValue(0),  // ✅ función que retorna valor
  };
  ```
- **Si el componente expone `this.signalName` como propiedad** → usar `signal()` real:
  ```typescript
  // Componente: score = inject(GameService).score.asReadonly();
  // Template: {{ score() }}
  import { signal } from '@angular/core';
  const mockService = {
    score: signal(0) as unknown as ReturnType<typeof signal>,
  };
  providers: [{ provide: GameService, useValue: mockService }]
  ```
- Mock completo: incluye TODOS los metodos que el componente llama (incluso `stopLoop` en ngOnDestroy)
- `vi.clearAllMocks()` en afterEach, `vi.restoreAllMocks()` para restaurar

### RouterLink y ActivatedRoute en Tests
Cuando un componente standalone usa `RouterLink` en su template, los tests necesitan:
```typescript
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

await TestBed.configureTestingModule({
  imports: [MiComponente],
  providers: [
    provideRouter([]),  // ✅ necesario para RouterLink
    { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
  ]
}).compileComponents();
```

**IMPORTANTE: NO uses atributos HTML para verificar routerLink.** 
- ❌ `getAttribute('routerlink')` — NO existe en el DOM
- ❌ `getAttribute('ng-reflect-router-link')` — NO se genera en Vitest+jsdom (solo en test dev mode con ciertas configs)
- ✅ En unit tests: verifica que el boton existe con texto correcto. La navegacion real se prueba en E2E.
- ✅ Alternativa: `By.directive(RouterLink)` + `fixture.debugElement.query(By.directive(RouterLink))`

### Mock de servicios con tokens de clase (ERROR COMUN)
Usa SIEMPRE la CLASE real como token de provider. NO uses string.
```typescript
// ✅ CORRECTO: token = clase real
TestBed.configureTestingModule({
  providers: [
    { provide: GameService, useValue: mockGameService },
  ]
});

// ❌ INCORRECTO: string como token - NO funciona (Angular inyecta por clase)
TestBed.configureTestingModule({
  providers: [
    { provide: 'GameService', useValue: mockGameService },  // no matchea con inject(GameService)
  ]
});
```
Cuando el componente usa `inject(GameService)` o `inject(HighScoreService)`, el token debe ser la CLASE.
Si usas string, Angular no encuentra el provider y usa el real.

### overrideProvider timing (ERROR COMUN)
`overrideProvider` debe llamarse ANTES de `compileComponents()`, NUNCA despues.
```typescript
// ✅ CORRECTO
beforeEach(async () => {
  TestBed.overrideProvider(GameService, { useValue: mockGameService });
  await TestBed.compileComponents();
});

// ❌ INCORRECTO - lanza "Cannot override provider when test module already instantiated"
beforeEach(async () => {
  await TestBed.compileComponents();
  TestBed.overrideProvider(...);  // muy tarde
});
```
Si ya hiciste `createComponent()` y necesitas otro mock, crea un nuevo TestBed fresco:
```typescript
it('test con mock diferente', async () => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ ... });
  await TestBed.compileComponents();
  fixture = TestBed.createComponent(...);
});
```

### `{ hasText }` (Playwright) vs seleccion por texto (Vitest)
**Playwright** usa `hasText` como opcion de filtro, NO como pseudo-selector CSS:
```typescript
// PLAYWRIGHT ✅
page.locator('button', { hasText: 'REINTENTAR' });
page.getByText('REINTENTAR');

// PLAYWRIGHT ❌ - :contains() no existe
page.locator('button:contains("REINTENTAR")');
```

**Vitest/Angular** NO tiene `hasText` ni `:contains()`. Filtra por textContent:
```typescript
// VITEST ❌ - NO existe
fixture.debugElement.query(By.css('button:has-text("REINTENTAR")'));

// VITEST ✅ - accede al textContent nativo
const buttons = fixture.debugElement.queryAll(By.css('button.neon-button'));
const retry = buttons.find(b => b.nativeElement.textContent.trim() === 'REINTENTAR');
```

### Verifica template ANTES de escribir mocks
1. Lee el `.html` con `Read` tool.
2. Identifica CADA llamada a servicio: ¿usa `service.metodo()` o `service.propiedad`?
3. El mock debe coincidir EXACTAMENTE:
   - `gameService.score()` en template → mock debe tener `score` como función
   - `highScoreService.getHighScore()` → mock debe tener `getHighScore` como función
   - `[routerLink]="['/game']"` → necesario `provideRouter([])` en providers

## Tests E2E (Playwright)
- Archivos SIEMPRE en `e2e/[nombre].e2e.spec.ts` (NUNCA junto al componente)
- **LEE el HTML antes de escribir selectores**: usa `Read` tool para ver el template real
- Copia clases, IDs y texto EXACTOS del HTML. NO inventes.
  ```typescript
  await expect(page.locator('h1.welcome-title')).toContainText('DINOSAUR RUNNER');
  ```
- Game Over: usa `page.evaluate()` para forzar estado, no esperes colision natural
- Textos en español: usa los reales del template ("Puntuación:", "Reintentar")
- playwright.config.ts: `testDir: './e2e'`, `testMatch: '**/*.e2e.spec.ts'`
- **NO usar `window.gameService`** en E2E. Usar atributos `data-*` en el HTML del componente para exponer estado del juego. Ejemplos de atributos data-* utiles:
  - `data-dino-y` — posicion Y del dinosaurio
  - `data-jump-count` — contador de saltos
  - `data-obstacle-count` — contador de obstaculos
  - `data-game-state` — estado del juego (playing/game-over)
  - `data-score` — puntuacion actual
- **REGLAS E2E CRITICAS:**
  - Usar `page.waitForFunction()` en vez de `page.waitForTimeout(n)` cuando esperas una condicion (ej: `() => document.querySelector('[data-obstacle-count]')?.textContent !== '0'`)
  - `page.waitForTimeout(n)` solo para pausas cortas (max 1000ms). Para esperar condiciones usa waitForFunction.
  - Score: validar con regex `/^\\d+$/` en lugar de texto exacto
  - El score inicial y final son strings numericos ("0", "100"), NO numeros
  - webServer en playwright.config.js debe tener `command: 'npm run start'`
  - Navegacion: `await page.goto('/')` para cada test
- **NO llamar `page.waitForTimeout` despues de `expect`** (causa timeout innecesario)

### Selectores E2E (NO usar :contains)
Playwright NO soporta `:contains()`. Alternativas:
- ✅ `page.getByText('DINOSAUR RUNNER')` — mas legible
- ✅ `page.locator('h1', { hasText: 'DINOSAUR RUNNER' })` — con filtro
- ✅ `page.locator('button').filter({ hasText: 'Reintentar' })` — filtrar botones
- ❌ `page.locator('button:contains("Reintentar")')` — NO funciona

## Archivos que NO deben borrarse sin orden explicita
- `src/app/app.ts`, `app.config.ts`, `app.routes.ts`, `src/main.ts`

## Estructura esperada del proyecto
```
src/
  index.html, main.ts, styles.scss
  app/
    app.ts, app.config.ts, app.routes.ts
    welcome/          welcome.component.*
    game/             game.component.*
    game-over/        game-over.component.*
    services/         game.service.ts, high-score.service.ts
e2e/
  welcome.e2e.spec.ts, game.e2e.spec.ts, game-over.e2e.spec.ts
```
