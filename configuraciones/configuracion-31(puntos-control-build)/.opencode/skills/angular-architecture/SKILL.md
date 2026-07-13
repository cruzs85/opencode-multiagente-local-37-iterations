---
name: angular-architecture
description: Convencion de nombrado Angular (version definida en AGENTS.md, con sufijo .component)
---

# Convencion de Nombrado Angular (v{ANGULAR_VERSION})

> **Importante**: La version de Angular esta definida en `AGENTS.md` como `ANGULAR_VERSION`.

## Regla general

Cada componente standalone se aloja en su propia subcarpeta dentro de `src/app/`, nombrada en **kebab-case**.
Usar `ng generate component` para crear cada componente.

**Angular usa sufijo `.component` en archivos y sufijo `Component` en nombres de clase.**
- Archivos: `[kebab-case].component.ts`, `[kebab-case].component.html`, `[kebab-case].component.scss`
- Clase: `PascalCase + Component`

| Componente | Carpeta | Archivos (Angular v{ANGULAR_VERSION}) |
|---|---|---|
| `WelcomeComponent` (clase) | `src/app/welcome/` | `welcome.component.ts`, `.html`, `.scss`, `.spec.ts` |
| `GameComponent` (clase) | `src/app/game/` | `game.component.ts`, `.html`, `.scss`, `.spec.ts` |
| `GameOverComponent` (clase) | `src/app/game-over/` | `game-over.component.ts`, `.html`, `.scss`, `.spec.ts` |

## Angular 21 defaults importantes

| Aspecto | Default Angular 21 | Notas |
|---------|-------------------|-------|
| Test runner | **Vitest** (no Karma/Jasmine) | Los `.spec.ts` usan `describe/it/expect` de Vitest |
| Change detection | **Zoneless** (no Zone.js) | Usar `provideZonelessChangeDetection()` en app.config |
| Build system | `@angular/build` (application builder) | Configurado en angular.json |
| Componentes | Standalone por defecto | No se usa NgModules |
| HttpClient | `provideHttpClient(withFetch())` global | No se importa por componente |
| Routing | `provideRouter(routes, withComponentInputBinding())` | |

## Configuracion de tests (Vitest)

```typescript
// Los spec files usan la API de Vitest:

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  it('should render title', async () => {
    await render(WelcomeComponent);
    expect(screen.getByText('DINO RUNNER')).toBeTruthy();
  });
});
```

> **IMPORTANTE**: No instalar Karma, Jasmine ni Zone.js. Usar los defaults que genera `ng new`.

## Reglas de estilo Angular 21

1. **`inject()` en vez de constructor DI** — desde Angular 14+ se prefiere
2. **`styleUrl` (singular) no `styleUrls` (plural)** — desde Angular 17+
3. **Control flow `@if/@for/@switch`** en vez de `*ngIf/*ngFor`
4. **Signals** para estado reactivo (`signal()`, `computed()`, `effect()`)
5. **`provideHttpClient(withFetch())`** en app.config, no importar `HttpClientModule`

## Estructura del proyecto

```
src/
  index.html
  main.ts
  styles.scss
  app/
    app.ts              (clase AppComponent, selector 'app-root')
    app.config.ts       (ApplicationConfig con provideRouter, provideZonelessChangeDetection)
    app.routes.ts       (Routes)
    welcome/
      welcome.component.ts, welcome.component.html, welcome.component.scss, welcome.component.spec.ts
    game/
      game.component.ts, game.component.html, game.component.scss, game.component.spec.ts
    game-over/
      game-over.component.ts, game-over.component.html, game-over.component.scss, game-over.component.spec.ts
    services/
      game.service.ts, game.service.spec.ts
      high-score.service.ts, high-score.service.spec.ts
e2e/
  welcome.e2e.spec.ts
  game.e2e.spec.ts
  game-over.e2e.spec.ts
```

## Tests E2E

Los archivos `.e2e.spec.ts` van SIEMPRE en `e2e/`:
```
e2e/[nombre].e2e.spec.ts       SIEMPRE en e2e/
src/app/[comp]/[comp].e2e.spec.ts  NUNCA junto al componente
```

### playwright.config.ts para E2E

Antes de crear tests E2E, verificar que `playwright.config.ts` tenga:
- `testDir: './e2e'` (no `'./src'`)
- `testMatch: '**/*.e2e.spec.ts'`
- `webServer` configurado con `command: 'npm run start'`
