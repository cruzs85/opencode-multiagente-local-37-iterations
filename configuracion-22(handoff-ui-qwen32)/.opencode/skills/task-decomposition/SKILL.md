---
name: task-decomposition
description: Convierte tareas complejas en pasos concretos, ejecutables y compatibles con la arquitectura Angular 21 + signals del proyecto el Proyecto. Optimizada para que code-writer (modelo pequeño) pueda ejecutar sin ambigüedad.
---

## Objetivo
Transformar una solicitud general en una lista de pasos claros, secuenciales y verificables que puedan ser ejecutados por un agente de código sin necesidad de razonamiento complejo.

---

## CLASIFICACIÓN DE TAREA (OBLIGATORIO)

Antes de descomponer, clasificar la tarea en:

- project-scaffolding 
- package-installation
- ui-refactor
- service-logic
- api-integration
- testing

Luego:

- Si es project-scaffolding → delegar a @package-manager (debe cargar angular-scaffolding) 
- Si es package-installation → delegar a @package-manager
- Si es ui-refactor → delegar a @code-writer
- Si es mixta → dividir por tipo de agente


## REGLAS GENERALES

1. SIEMPRE dividir en pasos numerados y secuenciales
2. Cada paso debe afectar SOLO un archivo o responsabilidad clara
3. SIEMPRE indicar rutas exactas de archivos (src/app/...)
4. NUNCA usar lenguaje ambiguo:
   - ❌ "ajustar", "mejorar", "revisar"
   - ✅ "crear", "modificar", "añadir", "reemplazar"
5. NUNCA escribir código — solo instrucciones
6. Incluir SIEMPRE criterios de éxito verificables
7. NUNCA escribas código en el plan, ni como ejemplo, ni como fragmento, ni como pseudocódigo. Para un método, escribe únicamente su firma con tipos: 'getRoute(points: RoutePoint[]): Observable<LatLngTuple[]>'. El cuerpo lo implementa @code-writer.

### REGLA CRÍTICA: NO fragmentar la creación de un archivo

❌ INCORRECTO (lo que hizo el decomposer en el ciclo anterior):
  3. Crear archivo game.service.ts (bash)
  4. Implementar método startGame() en GameService (edit)
  5. Implementar método jump() en GameService (edit)
  ...

✅ CORRECTO:
  3. Crear archivo game.service.ts con TODOS sus métodos: 
     startGame(), jump(), gameLoop(), generateObstacle(), 
     checkCollision(), saveHighScore(), resetGame()

REGLAS:
- 1 archivo nuevo = 1 solo paso de creación con bash heredoc
- NO dividir un archivo nuevo en "crear + N edits de métodos"
- Los edits (con herramienta edit) solo se usan para modificar 
  archivos YA EXISTENTES, no para construir uno nuevo por partes

8. Cuando un paso implementa un archivo que consume a otro (ej: componente que usa servicio), indica explícitamente: "Antes de implementar, lee [ruta del archivo fuente] y usa los nombres exactos de sus métodos y propiedades públicas."
9. Cuando un paso requiera crear o sobreescribir un archivo completo, indica explícitamente: 'Usa bash para escribir el archivo completo'. Cuando un paso requiera modificar solo parte de un archivo, indica: 'Usa edit para reemplazar [fragmento específico]'.
---

## CRITERIOS DE VALIDACIÓN DE BUILD

Al descomponer tareas, clasifica el tipo de cambio para determinar si requiere validación de @qa-validator:

**Cambios que REQUIEREN validación de @qa-validator:**
- Modificaciones a archivos en `src/` (componentes, servicios, pipes, etc.)
- Cambios en `angular.json` (configuración del build)
- Cambios en `tsconfig.json` (configuración de TypeScript)
- Cambios en `package.json` (dependencias)
- Cambios que afecten el compilador de Angular o TypeScript

**Cambios que NO requieren validación de @qa-validator:**
- Modificaciones a `AGENTS.md` (documentación del sistema)
- Cambios en `opencode.json` (configuración de agentes)
- Modificaciones a Skills (`.opencode/skills/*.md`)
- Cambios en `README.md` u otros archivos de documentación
- Cambios en archivos de configuración que no afecten el build de la app

**NOTA:** Al final del plan de implementación, indica explícitamente: "ESTE CAMBIO: [REQUIERE/NO REQUIERE] validación de @qa-validator"

---

## REGLAS ESPECÍFICAS DEL PROYECTO

### Arquitectura Angular

- Componentes: standalone (NO NgModules)
- Servicios: providedIn: 'root'
- Estado SIEMPRE con signals
- Templates con @if, @for (NO *ngIf/*ngFor)

---

### Servicios (MUY IMPORTANTE)

Cuando una tarea involucre estado:

- Crear signal privado:
  `private readonly _estado = signal<T>(valorInicial)`

- Exponer como readonly:
  `readonly estado = this._estado.asReadonly()`

- NO exponer signals mutables

---

### Effects

Si hay interacción con UI o mapa:

- Usar `effect()`
- SIEMPRE con `{ injector }`

---

### Event Listeners (NUEVO)
Cuando un componente registre event listeners en `window`, `document` o elementos fuera del template Angular:
- El plan DEBE especificar: "Usar afterNextRender() para registrar y DestroyRef.onDestroy() para limpiar"
- Incluir ambos en la descripción del paso

---

### Leaflet (mapa)

- Inicializar en `afterNextRender()`
- Coordenadas:
  - Leaflet: [lat, lng]
  - APIs externas: revisar conversión

---

### OSRM (si aplica)

- Convertir puntos a formato: `lng,lat`
- Convertir respuesta a `[lat, lng]`
- Manejar fallback a línea recta

---

### IndexedDB

- Nunca asumir disponibilidad en tests
- Si la tarea toca tests:
  → considerar mocks o polyfills

---

## TIPOS DE TAREAS Y CÓMO DESCOMPONER

---

### 1. NUEVA FEATURE

Estructura obligatoria:

1. Crear modelo (si aplica)
2. Crear/actualizar servicio (UN SOLO PASO para todo el archivo)
3. Añadir signals necesarios
4. Integrar en componente(s)
5. Añadir lógica reactiva (effect)
6. Validar render

---

### 2. INTEGRACIÓN DE API

1. Crear servicio en `core/services`
2. Definir método público claro
3. Manejar errores explícitamente
4. Convertir datos al formato del proyecto
5. Integrar en componente o servicio existente

---

### 3. BUG

1. Identificar archivo exacto afectado
2. Describir causa probable (1 línea)
3. Indicar cambio puntual
4. Verificar impacto en otros archivos (si aplica)

---

### 4. TESTS

1. Identificar archivo `.spec.ts`
2. Determinar dependencia problemática
3. Definir mock o polyfill necesario
4. Ajustar expectativa si está desactualizada

---

### 5. REFACTOR

1. Listar archivos afectados
2. Mantener API pública
3. No romper signals existentes
4. Ajustar imports si es necesario

### 6. PROJECT SCAFFOLDING

1. Delegar a @package-manager con instrucciones explícitas de `ng new`
2. Indicar la ruta del directorio raíz exacta del proyecto
3. Si el directorio NO está vacío:
   - Usar subdirectorio temporal (`.ng-temp`)
   - Mover archivos con `cp` y `rm`
   - Excluir `.opencode/` si existe
4. Post-creación: ejecutar `npm install` y `npm run build`
5. El @package-manager DEBE cargar la skill `angular-scaffolding` antes de ejecutar

---

## LO QUE DEBES Y NO DEBES INCLUIR EN EL PLAN

✅ PERMITIDO:
- Ruta exacta del archivo: src/app/core/services/osrm.service.ts
- Nombre de clase/interfaz: OsrmService, RoutePoint
- Firma de método con tipos: getRoute(points: RoutePoint[]): Observable<LatLngTuple[]>
- Descripción de comportamiento: "debe manejar error con fallback a línea recta"
- Dependencias a inyectar: HttpClient via inject()

❌ PROHIBIDO:
- Bloques de código TypeScript, HTML o CSS (ni entre backticks)
- Pseudocódigo o "algo como esto: ..."
- Lógica interna de métodos ("primero hace X, luego llama a Y con .pipe()")
- Ejemplos de implementación "para ilustrar"

## FORMATO DE SALIDA (OBLIGATORIO)

TAREA DESCOMPUESTA:

1. [Acción concreta] en [ruta de archivo]
2. [Acción concreta] en [ruta de archivo]
3. ...

CRITERIOS DE ÉXITO:

- [Condición verificable]
- [Condición verificable]
- npm run build sin errores
- npm test pasa completamente

---

## HEURÍSTICAS IMPORTANTES

- Si una tarea implica MÁS de un archivo → dividir obligatoriamente
- Si involucra estado → usar signals
- Si involucra UI → usar effect()
- Si involucra datos externos → validar formato
- SIEMPRE pensar en cómo lo ejecutará un modelo pequeño (14B)
- 1 archivo nuevo = 1 solo paso de creación. NO subdividir en métodos individuales