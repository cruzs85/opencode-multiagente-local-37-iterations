---
name: angular-architecture
description: Protocolo de arquitectura Angular moderna para este proyecto. Define patrones de diseño, reglas de components standalone, gestión de estado con signals y mejores prácticas de inyección de dependencias.
---

# OBJETIVO

Establecer la arquitectura técnica estándar para el proyecto, garantizando:
- Componentes Standalone (sin NgModules)
- Estado reactivo con Signals
- Inyección de dependencias con inject()
- Seguridad SSR con afterNextRender()
- Patrones de diseño escalables y mantenibles

---

# ARQUITECTURA DE COMPONENTES

## Standalone Components (OBLIGATORIO)

Todos los componentes deben seguir este patrón:

```typescript
@Component({
  selector: 'app-component-name',
  standalone: true,
  imports: [/* dependencias */],
  templateUrl: './component-name.html',
  styleUrl: './component-name.scss'
})
export class ComponentName {
  // inyección con inject()
  private service = inject(Service);
}
```

**Reglas:**
- `standalone: true` es OBLIGATORIO
- `selector` debe comenzar con `app-`
- Separar templates (.html) y estilos (.scss)
- NUNCA usar `@NgModule`

---

# GESTIÓN DE ESTADO CON SIGNALS

## Patrón de Signals para Servicios

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureService {
  // Privado: mutable
  private readonly _state = signal<StateType>(initialValue);

  // Público: readonly
  readonly state = this._state.asReadonly();

  // Computado: derivados
  readonly derived = computed(() => {
    const currentState = this._state();
    return transform(currentState);
  });
}
```

**Reglas:**
- Signals privados: `_value` (mutable)
- Signals públicos: `readonly value` (asReadonly)
- Computados: usar `computed()` para valores derivados
- Servicios: `@Injectable({ providedIn: 'root' })`

---

## Effects con Injector (OBLIGATORIO)

```typescript
export class ComponentName {
  private injector = inject(Injector);
  private _state = signal(initialValue);

  constructor() {
    effect(() => {
      const value = this._state();
      // efecto reactivo
    }, { injector: this.injector });
  }
}
```

**Reglas:**
- SIEMPRE usar `{ injector }` para evitar memory leaks
- Efectos sin side effects cíclicos
- Usar para interacción con UI, APIs externas, DOM

---

# INYECCIÓN DE DEPENDENCIAS

## Patrón de Inyección

```typescript
// CORRECTO
export class ComponentName {
  private service = inject(Service);
  private router = inject(Router);
  private http = inject(HttpClient);
}

// INCORRECTO
constructor(
  private service: Service,  // ❌ No usar constructores
  private router: Router
) {}
```

**Reglas:**
- Usar `inject()` en lugar de constructores
- Declarar como `private readonly`
- NUNCA usar `new Service()`

---

# SEGURIDAD SSR

## afterNextRender() (OBLIGATORIO)

```typescript
export class ComponentName {
  constructor() {
    afterNextRender(() => {
      // Referencias a window, document, L, map
      const map = L.map('map-container');
      window.addEventListener('resize', handler);
    });
  }
}
```

**Reglas:**
- Toda referencia a `window`, `document`, `L` (Leaflet), `map` debe estar dentro de `afterNextRender()`
- Importar `afterNextRender` desde `@angular/core`
- Solo código que requiere acceso al DOM/Browser API

---

# ESTRUCTURAS DE CONTROL EN TEMPLATES

## Bloques de Control (Sintaxis v17+)

```html
@if (condition) {
  <div>Contenido</div>
} @else if (otherCondition) {
  <div>Alternativa</div>
} @else {
  <div>Default</div>
}

@for (item of items(); track item.id) {
  <app-item [data]="item" />
}

@switch (value) {
  @case ('A') { <span>A</span> }
  @case ('B') { <span>B</span> }
  @default { <span>Other</span> }
}
```

**Reglas:**
- Usar `@if`, `@for`, `@switch` (NO `*ngIf`, `*ngFor`)
- `@for` requiere `track` (track by)
- Invocar signals como funciones: `{{ signal() }}`

---

# PATRONES DE DISEÑO

## Componentes vs Servicios

### Componentes
- Responsabilidad: presentación e interacción
- Estado local: signals
- Inyectar servicios, no lógica de negocio

### Servicios
- Responsabilidad: lógica de negocio, datos, API calls
- Estado compartido: signals readonly
- Métodos públicos para acciones

---

## Separación de Responsabilidades

```
component.html  ←  Presentación
component.ts    ←  Lógica de interacción
service.ts      ←  Lógica de negocio + estado
```

---

# REGLAS DE ESTILO

## BEM + SCSS

```scss
:host {
  display: block;
}

.component-name__element {
  // estilos
}

.component-name__element--modifier {
  // estilos modificados
}
```

**Reglas:**
- `:host` es OBLIGATORIO en componentes
- Usar BEM: `block__element--modifier`
- Variables locales: `$variable: value;`

---

# INTEGRACIÓN CON OTRAS SKILLS

## Referencias cruzadas

- `angular-patterns.md`: Reglas de sintaxis Angular detalladas
- `angular-packages.md`: Instalación y configuración de dependencias
- `task-decomposition.md`: Protocolo de descomposición de tareas
- `qa-protocol.md`: Validación técnica y arquitectónica

---

# PATRÓN DE COMPONENTES REUTILIZABLES

## Inputs y Outputs

```typescript
@Component({...})
export class ReusableComponent {
  // Inputs
  readonly data = input.required<T>();
  readonly config = input<ConfigType>(defaultConfig);

  // Outputs
  readonly change = output<ChangeEvent>();
}
```

**Reglas:**
- Usar `input()` y `output()` (NO `@Input`, `@Output`)
- `required` para inputs obligatorios
- Outputs tipados

---

# VALIDACIÓN DE ARQUITECTURA

## Checklist de QA

- [ ] Todos los componentes son `standalone: true`
- [ ] No existen archivos `*.module.ts`
- [ ] Toda inyección usa `inject()` (no constructores)
- [ ] Signals privados, públicos como `readonly`
- [ ] Effects con `{ injector }`
- [ ] `afterNextRender()` para DOM/Browser APIs
- [ ] Templates con `@if`, `@for`, `@switch`
- [ ] Servicios con `providedIn: 'root'`

---

# PATRÓN DE ROUTING

## Router + Signals

```typescript
export class FeatureComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly id = computed(() => {
    return this.route.snapshot.params['id'];
  });
}
```

**Reglas:**
- Inyectar `Router` y `ActivatedRoute` con `inject()`
- Usar `computed()` para derivados de parámetros de ruta

---

# MANEJO DE ERRORES

## Error Handling en Servicios

```typescript
@Injectable({...})
export class ApiService {
  private readonly _error = signal<Error | null>(null);
  readonly error = this._error.asReadonly();

  async fetchData(): Promise<Data> {
    try {
      const response = await this.http.get<Data>(url);
      this._error.set(null);
      return response;
    } catch (err) {
      this._error.set(err as Error);
      throw err;
    }
  }
}
```

**Reglas:**
- Signals para estado de error
- Propagar errores al componente
- Manejar casos específicos (404, 500, network)

---

## Limpieza de recursos (OBLIGATORIO)
Todo event listener registrado en `window`, `document` o cualquier elemento fuera del
template Angular DEBE limpiarse al destruir el componente:
```typescript
private destroyRef = inject(DestroyRef);
afterNextRender(() => {
  const handler = () => { ... };
  window.addEventListener('keydown', handler);
  this.destroyRef.onDestroy(() => {
    window.removeEventListener('keydown', handler);
  });
});
```

**Reglas:**
- Todo addEventListener debe tener su removeEventListener correspondiente
- Usar inject(DestroyRef) + onDestroy() para la limpieza
- NUNCA dejar listeners colgados en window/document

---

# DIAGNÓSTICO DE BOOTSTRAP

## Propósito
Detectar errores de arranque de Angular en entornos headless (Playwright, CI) donde los errores de runtime se tragan silenciosamente y se ve página en blanco.

## window.onerror OBLIGATORIO en AppComponent

AGREGAR en el constructor del componente raíz (AppComponent) **antes de cualquier otra lógica**:

```typescript
constructor() {
  console.log('[DIAG] AppComponent bootstrapping...');
  (window as any).onerror = function(
    msg: string | Event,
    url?: string,
    line?: number,
    col?: number,
    error?: Error
  ) {
    console.error('[DIAG] RUNTIME ERROR:', msg, 'at', url, ':', line);
    document.title = 'BOOT_ERROR: ' + String(msg).slice(0, 50);
    document.body.innerHTML = '<h1 style="color:red">Error: ' + msg + '</h1>' +
      '<pre>' + url + ':' + line + '</pre>';
  };
}
```

## Verificación de consola en Playwright
En tests E2E, capturar logs de consola del navegador:
```typescript
const logs: string[] = [];
page.on('console', msg => logs.push(msg.text()));
page.on('pageerror', err => logs.push('PAGE ERROR: ' + err.message));
// ... after navigation
expect(logs.filter(l => l.includes('BOOT_ERROR'))).toEqual([]);
```

## Excepción: Injector en servicios
Cuando un servicio NECESITE usar `effect()` o `afterNextRender()`, la inyección de
`Injector` se permite en el constructor como ÚNICA excepción:
```typescript
@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private injector: Injector) { }  // ← Única excepción permitida
}
```

---

# PATRÓN DE TESTING

## Test Structure

```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceName]
    });
    service = TestBed.inject(ServiceName);
  });

  it('should...', () => {
    // assertions
  });
});
```

**Reglas:**
- Inyectar servicios con `TestBed.inject()`
- Mock dependencies cuando sea necesario
- Testear signals: `service.signal()`

---

# REFERENCIAS A PROYECTO

## Contexto de Proyecto

> NOTA: Las secciones siguientes (Leaflet, OSRM, IndexedDB) son referencias heredadas. 
> Para el juego Dino Runner no aplican, pero se mantienen por compatibilidad con otros skills.

El proyecto dino-runner4 implementa un juego de dinosaurio runner con:
- Angular 21.2.0 (Standalone Components)
- Signals para gestión de estado reactivo
- Vitest 4.0.8 para testing
- Gravedad, salto y colisiones procedurales
- Puntuación con localStorage

Este protocolo se aplica específicamente a esta arquitectura.

---

*Este protocolo debe ser seguido estrictamente por @code-writer, @decomposer y @qa-validator.*