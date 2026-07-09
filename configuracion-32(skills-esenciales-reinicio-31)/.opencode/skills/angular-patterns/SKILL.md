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
- Antes de importar, usa `find/grep` para LOCALIZAR el archivo real. NO adivines rutas.
- Antes de usar propiedades de un servicio, LEE el archivo completo. NO inventes nombres.
- Antes de crear un archivo, verifica con `glob` que no exista ya. Si existe, MODIFICALO.

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

## Tests Unitarios (Vitest)
- Ejecutar: `npm run test -- --watch=false` (NO `npx vitest run`)
- NO crear `vitest.config.ts` ni `test-setup.ts`. El builder @angular/build:unit-test maneja todo.
- NO instalar `@angular/platform-browser-dynamic` (causa conflictos).
- Mock de signals: usar `signal(valor)`, NO `vi.fn().mockReturnValue(valor)`
  ```typescript
  const mockService = {
    score: signal(0) as unknown as ReturnType<typeof signal>,
    highScore: signal(100),
    gameOver: signal(false),
    jump: vi.fn(),
  };
  providers: [{ provide: GameService, useValue: mockService }]
  ```
- Mock completo: incluye TODOS los metodos que el componente llama (incluso `stopLoop` en ngOnDestroy)
- `vi.spyOn(objeto, 'metodo')`, NO `spyOn` (Jasmine)
- Metodos privados: testear via metodo publico o bracket notation `service['metodo']()`
- `vi.clearAllMocks()` en afterEach, `vi.restoreAllMocks()` para restaurar
- localStorage: `vi.spyOn(Storage.prototype, 'getItem')`, NO `Object.defineProperty`

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
