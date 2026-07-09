# Sistema de Agentes - Proyecto Prueba1

## Introducción

Este documento describe el sistema de agentes implementado en el proyecto **Prueba1**, una aplicación Angular 21.2.0 que implementa un juego estilo "Dinosaur Runner" similar al juego offline de Chrome. El sistema de agentes está diseñado para automatizar y optimizar el desarrollo del proyecto siguiendo las mejores prácticas de Angular moderno.

## Arquitectura del Proyecto

- **Framework**: Angular 21.2.0 (Standalone Components)
- **Stack**: Angular Core, Common, Router, Forms, Platform-Browser, RxJS, TypeScript 5.9.2
- **Testing**: Vitest 4.0.8
- **Arquitectura**: Standalone Components con Signals
- **Estado**: Signals reactivos para gestión de estado
- **Inyección**: `inject()` en lugar de constructores

## Descripción de la Aplicación

El proyecto implementa un juego de dinosaurio runner con las siguientes características:

- **Física de gravedad y salto**: Sistema de movimiento realista con gravedad
- **Generación procedural de obstáculos**: Obstáculos generados dinámicamente
- **Sistema de puntuación**: Puntuación con persistencia en localStorage
- **Detección de colisiones**: Sistema de colisiones entre dinosaurio y obstáculos
- **Velocidad incremental**: Dificultad que aumenta con la puntuación
- **Controles**: Tecla espacio o flecha arriba para saltar

## Agentes Disponibles

### 1. **build** (Orquestador) - `zai-coding-plan/glm-4.7`
**Descripción**: Coordina todos los agentes del sistema
**Responsabilidades**:
- Orquestar el flujo de trabajo estándar
- Coordinar entre decomposer, code-writer, qa-validator y otros agentes
- Garantizar el cumplimiento del protocolo

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- SIN acceso a edición directa (REGLA SUPREMA)
- FLUJO ESTÁNDAR: decomposer → code-writer → qa-validator → (opcional) unit-tester/e2e-validator
- Usa @explorer obligatoriamente para explorar código antes de cualquier acción

### 2. **decomposer** - `zai-coding-plan/glm-4.7`
**Descripción**: Descompone tareas complejas en pasos atómicos y técnicos
**Responsabilidades**:
- Analizar requerimientos y descomponer en pasos ejecutables
- Clasificar tareas: package-installation, ui-refactor, service-logic, api-integration, testing
- Especificar rutas completas de archivos
- Indicar exactamente qué líneas o bloques cambiar

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- Clasifica cada paso con: [package-manager], [code-writer] o [researcher]
- Formato de salida: Fases (Preparación, Implementación, Validación)
- Nunca escribe código directamente

### 3. **explorer** - `openrouter/xiaomi/mimo-v2-flash`
**Descripción**: Explora y analiza el codebase sin modificar nada
**Responsabilidades**:
- Identificar archivos relevantes para la tarea
- Entender flujos de datos y dependencias
- Localizar exactamente dónde hacer cambios
- Analizar estructura del proyecto

**Permisos**: bash, read, glob, grep, skill, webfetch
**Reglas Específicas**:
- Solo lectura, sin edición
- Debe ser invocado por @build antes de cualquier modificación

### 4. **researcher** - `ollama/deepseek-coder-v2:16b-lite-instruct-q4_K_M`
**Descripción**: Investiga APIs externas y propone soluciones técnicas
**Responsabilidades**:
- Investigar APIs externas y documentación
- Proponer interfaces de servicios Angular
- Analizar compatibilidad de librerías
- Sugerir patrones de implementación

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- Carga skills antes de responder
- Se enfoca en investigación y propuestas

### 5. **code-writer** - `openrouter/deepseek/deepseek-v3.2`
**Descripción**: Ejecutor de archivos que implementa cambios
**Responsabilidades**:
- Implementar cambios siguiendo instrucciones del @decomposer
- Editar archivos del proyecto
- Asegurar sintaxis correcta y patrones Angular

**Permisos**: edit, read, glob, grep
**Reglas Específicas**:
- USA EXCLUSIVAMENTE la herramienta 'edit'
- Recibe instrucciones del @decomposer
- Si el plan es ambiguo, solicita aclaración antes de escribir

### 6. **qa-validator** - `openrouter/deepseek/deepseek-v3.2`
**Descripción**: Valida cambios ejecutando build y tests
**Responsabilidades**:
- Validar cambios técnicos y funcionales
- Ejecutar build del proyecto
- Ejecutar pruebas unitarias
- Verificar integridad del código

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- Carga SIEMPRE las skills 'qa-protocol' y 'angular-architecture'
- OBLIGATORIO: Ejecuta SIEMPRE 'npm run build' antes de cualquier conclusión
- PROHIBIDO validar leyendo archivos manualmente sin ejecutar el build
- Máximo 3 iteraciones totales
- Delega correcciones a @code-writer

### 7. **package-manager** - `zai-coding-plan/glm-4.5-air`
**Descripción**: Instala y configura librerías y paquetes Angular
**Responsabilidades**:
- Instalar dependencias con npm/ng
- Configurar angular.json y app.config.ts
- Verificar compatibilidad con Angular 21

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- Carga las skills angular-architecture y angular-packages antes de actuar
- Prefiere `ng add` sobre `npm install`
- Configura angular.json y app.config.ts si es necesario

### 8. **e2e-validator** - `openrouter/qwen/qwen3-coder-next`
**Descripción**: Valida que la implementación cumple objetivos funcionales
**Responsabilidades**:
- Ejecutar pruebas E2E con Playwright
- Validar flujos de usuario completos
- Verificar funcionalidad end-to-end

**Permisos**: bash, skill, webfetch
**Reglas Específicas**:
- SOLO se invoca cuando el usuario lo solicita EXPLÍCITAMENTE
- Máximo 2 iteraciones

### 9. **unit-tester** - `openrouter/deepseek/deepseek-v3.2`
**Descripción**: Escribe y ejecuta pruebas unitarias
**Responsabilidades**:
- Escribir pruebas unitarias para lógica de negocio
- Ejecutar pruebas con Vitest
- Cubrir casos feliz, casos borde y casos de error

**Permisos**: edit, bash, skill, webfetch
**Reglas Específicas**:
- Usa Jest/Jasmine (caso feliz, casos borde, casos de error)
- Ejecuta 'npm test -- --testPathPattern=nombre.spec.ts'
- Solo usa 'edit' para archivos *.spec.ts
- SOLO se invoca si se creó/modificó lógica de negocio (cálculos, transformaciones, validaciones, algoritmos)

## Skills del Proyecto

### qa-protocol.md
Validación técnica y funcional para RouteTracker:
- **Standalone Check**: Confirmar que no se hayan introducido NgModules
- **Injection Check**: Verificar que toda nueva dependencia use inject()
- **Signal Integrity**: Asegurar que los effects no tengan efectos secundarios cíclicos
- **Leaflet SSR**: Validar que cualquier referencia a L o map esté envuelta en afterNextRender()
- **Criterios de rechazo**: constructor para inyección, Zone.js manual, errores de TypeScript

### angular-packages.md
Protocolo de instalación y configuración de dependencias:
- Verificar compatibilidad con Angular 21 y Signals
- Preferir siempre ng add
- Integrar módulos mediante importProvidersFrom en app.config.ts
- app.config.ts: Punto central de inyección, solo provide* functions
- angular.json: Solo modificar assets, styles o scripts
- Toda nueva librería de servicio debe inyectarse usando inject()
- No permitir archivos *.module.ts

### angular-patterns.md
Reglas estrictas de sintaxis Angular:
- **Componentes**: standalone:true, prefijo 'app-', inject() vs constructor
- **Archivos**: Separar .html y .scss
- **Servicios**: @Injectable({providedIn:'root'})
- **Privado**: _val = signal(x), Público: val = this._val.asReadonly()
- **Lógica**: Usar computed() para derivados
- **Estructuras de control**: @if(cond){}, @for(item of list; track item.id){}, @switch
- **Template**: Invocar signals como función {{ sig() }}
- **Effects**: private injector = inject(Injector); effect(fn, {injector: this.injector});
- **Estilos**: BEM + SCSS, :host obligatorio, variables locales
- **Imports Core**: signal, computed, effect, inject, Injectable, Component, Injector, input, output

### task-decomposition.md
Convierte tareas complejas en pasos concretos:
- **Clasificación de tarea**: package-installation, ui-refactor, service-logic, api-integration, testing
- **REGLAS GENERALES**: Dividir en pasos numerados, afectar solo un archivo, rutas exactas, lenguaje concreto, NO escribir código, incluir criterios de éxito
- **REGLAS ESPECÍFICAS**: Componentes standalone, Servicios providedIn: 'root', Estado SIEMPRE con signals, Templates con @if, @for
- **SERVICIOS**: Crear signal privado, exponer como readonly, NO exponer signals mutables
- **EFFECTS**: Usar effect() SIEMPRE con { injector }
- **Leaflet**: Inicializar en afterNextRender(), coordenadas [lat, lng]
- **OSRM**: Convertir puntos a formato lng,lat, convertir respuesta a [lat, lng], manejar fallback
- **IndexedDB**: Nunca asumir disponibilidad en tests

## Flujo de Trabajo Estándar

1. **Inicio**: Usuario solicita una tarea
2. **Orquestación**: @build toma control y coordina
3. **Exploración**: @explorer analiza el codebase (OBLIGATORIO)
4. **Descomposición**: @decomposer divide la tarea en pasos atómicos
5. **Implementación**: @code-writer ejecuta los cambios
6. **Validación**: SI los cambios afectaron código funcional → @qa-validator ejecuta build y tests. SI NO → omitir validación
7. **Corrección**: Si hay errores, @code-writer los corrige
8. **Validación Final**: @qa-validator verifica nuevamente
9. **Opcional**: @unit-tester o @e2e-validator si corresponde

## Reglas Importantes

### REGLA SUPREMA
@build NO tiene acceso a edición directa. Debe coordinar a otros agentes.

### REGLA E2E
@e2e-validator solo se invoca cuando el usuario lo solicita EXPLÍCITAMENTE.

### REGLA EXPLORACIÓN
@explorer debe ser invocado ANTES de cualquier modificación del código.

### REGLA FALLOS
Si @qa-validator detecta errores, delega correcciones a @code-writer. Máximo 3 iteraciones.

### REGLA QA SELECTIVO
@qa-validator DEBE invocarse SOLAMENTE cuando los cambios afecten código funcional de la aplicación:
- Archivos en `src/` (código Angular, TypeScript, componentes, servicios)
- `angular.json` (configuración del build)
- `tsconfig.json` (configuración de TypeScript)
- `package.json` (dependencias)

@qa-validator NO debe invocarse cuando los cambios sean en:
- `AGENTS.md` (documentación del sistema)
- `opencode.json` (configuración de agentes)
- `.opencode/skills/*.md` (documentación de protocolos)
- `README.md` u otros archivos de documentación

### REGLA BUILD
@qa-validator DEBE ejecutar 'npm run build' antes de cualquier conclusión de validación.

### REGLA E2E TERMINAL
@e2e-validator DEBE detenerse inmediatamente después de:
1. Confirmar que las pruebas pasaron
2. Validar el objetivo principal (ej: video generado)
3. Proporcionar resumen conciso

PROHIBIDO ejecutar toolcalls adicionales (ej: 'read', 'show-report') tras éxito funcional.

### REGLA DE TERMINACIÓN TEMPRANA
Todos los agentes DEBE terminar la tarea cuando:
- Se cumplió el objetivo principal declarado
- No hay fallas que requieran corrección
- Ya se ejecutaron las iteraciones máximas permitidas

## Patrones de Código

### Standalone Components
```typescript
@Component({
  selector: 'app-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './component.html',
  styleUrl: './component.scss'
})
```

### Signals
```typescript
private _data = signal<T[]>([]);
readonly data = this._data.asReadonly();
readonly count = computed(() => this._data().length);
```

### Effects
```typescript
private injector = inject(Injector);

constructor() {
  effect(() => {
    // lógica reactiva
  }, { injector: this.injector });
}
```

### Inyección
```typescript
// CORRECTO
private service = inject(Service);

// INCORRECTO
constructor(private service: Service) {}
```

### Templates
```html
@if (isVisible()) {
  <div class="content">
    @for (item of items(); track item.id) {
      <app-item [data]="item" />
    }
  </div>
}
```

## Criterios de Validación

1. **Build exitoso**: `npm run build` debe completarse sin errores
2. **Tests pasan**: `npm test` debe ejecutarse correctamente
3. **Standalone**: No introducir NgModules
4. **Signals**: Usar signals para estado reactivo
5. **Inyección**: Usar inject() en lugar de constructores
6. **TypeScript**: Sin errores de tipo
7. **Performance**: Effects sin ciclos infinitos
8. **SSR**: Referencias a window/document/envueltas en afterNextRender()

---

*Documento actualizado: 07 de mayo de 2026*  
*Proyecto: Prueba1 - Angular 21.2.0 - Dinosaur Runner Game*