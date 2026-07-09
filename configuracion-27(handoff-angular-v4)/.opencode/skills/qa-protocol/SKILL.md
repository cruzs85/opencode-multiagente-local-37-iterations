---
name: qa-protocol
description: Protocolo de validación técnica y anti-loop para el Proyecto.
---

# OBJETIVO

Validar integridad técnica evitando ciclos infinitos entre:
- @qa-validator
- @code-writer
- @decomposer

---

# VALIDACIÓN TÉCNICA

## Standalone Check
Confirmar que no se hayan introducido `NgModules`.

## Injection Check
Toda nueva dependencia debe usar `inject()`.

## Signal Integrity
Los `effect()` no deben generar ciclos reactivos.

## SSR Safety (aplica a Leaflet, Canvas, DOM APIs)
Toda referencia a APIs del navegador (\`window\`, \`document\`, librerías que acceden al DOM) 
debe ejecutarse dentro de `afterNextRender()`.

---

# VALIDACIÓN FUNCIONAL

## Canvas / DOM (reemplaza a Mapa en juegos)
El contenedor Canvas debe tener dimensiones explícitas (width/height).

## IndexedDB
Las operaciones deben:
- ser async
- manejar quota exceeded
- manejar fallos transaccionales

## Signals
Los cambios de estado deben reflejarse sin recarga manual.

---

# VALIDACIÓN OBLIGATORIA

## Regla crítica

Está PROHIBIDO aprobar cambios sin ejecutar:

```bash
npm run build
```

Sin errores ni warnings de TypeScript.

## Pre-flight checks (ANTES de ejecutar build)

Ejecutar EN ESTE ORDEN antes de cualquier build o test:

### Check 1: Verificar estructura del componente raíz (ADAPTATIVO)
Angular 21+ genera `app.ts`, `app.html`, `app.scss` — son archivos VÁLIDOS, NO legacy.
```bash
if [ -f src/app/app.ts ] && [ -f src/app/app.component.ts ]; then
  echo "DUPLICATE: coexisten app.ts y app.component.ts — reportar a build"
elif [ -f src/app/app.ts ]; then
  echo "Angular 21+ (app.ts) — formato correcto"
elif [ -f src/app/app.component.ts ]; then
  echo "Angular <21 (app.component.ts) — formato correcto"
else
  echo "⚠️ No se detectó componente raíz — reportar a build"
fi
```

### Check 2: styleUrl (singular) — verificar que no se use styleUrls
```bash
grep -rn "styleUrls" src/app/ || echo "OK: no styleUrls found"
```
Si hay matches → reportar a build para que code-writer corrija a `styleUrl`.

### Check 3: main.ts importa el componente raíz correcto (ADAPTATIVO)
```bash
if [ -f src/app/app.ts ]; then
  grep -q "from './app/app'" src/main.ts && echo "OK: main.ts importa App (Angular 21+)" || echo "ERROR: main.ts debería importar App desde ./app/app"
elif [ -f src/app/app.component.ts ]; then
  grep -q "from './app/app.component'" src/main.ts && echo "OK: main.ts importa AppComponent" || echo "ERROR: main.ts debería importar AppComponent desde ./app/app.component"
fi
```
Si falla → reportar a build.

### Check 4: Sin selectores duplicados app-root
```bash
find src/app/ -name "*.ts" -exec grep -l "selector:.*app-root" {} \; | wc -l
```
Si >= 2 → BLOCKED. Selector duplicado causa bootstrap silencioso.

### Check 5: webServer en playwright.config.ts (OBLIGATORIO si hay E2E)
```bash
if [ -f playwright.config.ts ]; then
  grep -q "webServer" playwright.config.ts && echo "OK: webServer configurado" || echo "ERROR: falta webServer en playwright.config.ts — delegar a code-writer"
else
  echo "NO_EXISTE: playwright.config.ts — reportar a build"
fi
```
Si falta webServer → NO ejecutar E2E. Delegar a code-writer para añadirlo.

---

# LÍMITES DE ITERACIÓN

## Regla estricta

Máximo:
- 3 iteraciones totales por tarea
- 2 correcciones por @code-writer (vía handoff)
- 1 análisis de Root Cause por @decomposer

Secuencia permitida (flujo handoff):

1. build recibe handoff de verifier con archivos verificados
2. build delega a qa-validator con ruta del handoff JSON
3. qa-validator ejecuta `npm run build`
4. Si hay errores → cargar skill 'error-routing' para decidir destino:
   - code-writer (vía handoff directo tipo "correccion")
   - build (escalar porque requiere decisión)
5. code-writer corrige y crea handoff para verifier
6. verifier verifica y aplica error-routing si encuentra bugs
7. verifier crea handoff para qa-validator
8. qa-validator re-ejecuta `npm run build`
9. Máximo 2 correcciones por code-writer
10. Si el error persiste tras segunda corrección → error-routing escalará a build

---

# PROTOCOLO DE ESCALADO

## Escalar a @decomposer SOLO si:

- El mismo error reaparece tras la segunda corrección
- El error es de arquitectura (no de sintaxis)
- No se puede determinar la causa raíz

---

## Información obligatoria para escalado

Enviar SIEMPRE:

- Comando ejecutado
- Log completo del error
- Archivo(s) afectado(s)
- Línea(s) exacta(s) del error
- Intentos de corrección realizados
- Stack trace completo

---

# PROTOCOLO DE ESCALADO A @RESEARCHER

## Escalar a @researcher SOLO si:

- El error involucra una API externa no documentada
- Se necesita investigar una nueva librería o SDK
- No hay documentación disponible en el codebase

---

# PROHIBICIONES

## @qa-validator NO puede:

- Editar archivos de implementacion (prohibido ABSOLUTAMENTE)
- Editar archivos *.spec.ts y *.e2e.spec.ts (PERMITIDO — para corregir tests)
- Aprobar cambios sin ejecutar npm run build
- Validar leyendo archivos manualmente
- Ejecutar mas de 3 iteraciones
- Delegar el mismo error dos veces al mismo agente
- Ignorar warnings de TypeScript
- Auto-invocarse con task()
- **Usar `node -e` con `fs.writeFileSync` para escribir fuera de `/tmp/handoff/`** (cualquier escritura en `src/` invalida la iteración automáticamente)
- **Restaurar archivos de implementación** (si necesitas un backup, delega a code-writer)

🚫 **Si qa-validator escribe o restaura archivos de implementación, la iteración se marca como FALLIDA automáticamente y se escala al usuario.**
---

## @qa-validator DEBE:
- Ejecutar SIEMPRE `npm run build` antes de cualquier conclusion
- Ejecutar SIEMPRE los pre-flight checks (Check 1-4) antes del build
- Clasificar errores: [Sintaxis], [Arquitectura], [Logica]
- Cargar error-routing para decidir si delegar a @code-writer o escalar a build
- Verificar que todo uso de APIs del navegador este dentro de `afterNextRender()`
- Verificar que no se hayan introducido NgModules
---
1. El mismo error persiste tras:
   - 2 correcciones por @code-writer
   - 1 Root Cause Analysis por @decomposer

2. No hay suficiente información para resolver el error

3. El error requiere intervención humana (ej: configuración de infraestructura)

---

## Formato de cierre BLOCKED

```
ESTADO: BLOCKED
CAUSA: <descripción concisa>
ERROR: <mensaje exacto>
INTENTOS: <número>
LOG: <resumen del último error>
```

---

# EJEMPLOS DE VALIDACIÓN

## Ejemplo 1: Validación exitosa

```
@qa-validator: Ejecutando npm run build...
[salida: ✓ Build exitoso, 0 warnings]

✅ Validación aprobada:
- Build: exitoso
- TypeScript: sin errores
- Standalone: verificado
- Signals: correctos
- Inyección: correcta
```

---

## Ejemplo 2: Error de inyección

```
@qa-validator: Ejecutando npm run build...
[salida: ERROR src/app/component.ts:15: Constructor should use inject()]

❌ Validación fallada:
- Error: Constructor usado para inyección
- Archivo: src/app/component.ts:15

Delegando a @code-writer:
"Reemplazar constructor por inject() en ComponentName"
Referencia: angular-architecture.md sección "INYECCIÓN DE DEPENDENCIAS"
```

---

## Ejemplo 3: Error de SSR

```
@qa-validator: Ejecutando npm run build...
[salida: ERROR src/app/map.ts:23: ReferenceError: window is not defined]

❌ Validación fallada:
- Error: Referencia a window sin afterNextRender()
- Archivo: src/app/map.ts:23

Delegando a @code-writer:
"Envolver referencia a window en afterNextRender()"
Referencia: angular-architecture.md sección "SEGURIDAD SSR"
```

---

# INTEGRACIÓN CON AGENTES

## Flujo con @code-writer (vía handoff)

1. @code-writer implementa y crea handoff para verifier
2. @verifier verifica, aplica error-routing si hay bugs, y crea handoff para qa-validator
3. @qa-validator ejecuta `npm run build`
4. Si hay errores → cargar error-routing para decidir destino de la corrección
5. Si error-routing sugiere code-writer → handoff directo tipo "correccion"
6. Repetir hasta máximo 2 correcciones
7. Si persiste → error-routing escalará a build

---

## Flujo con @decomposer

1. @decomposer analiza Root Cause
2. Propone plan de corrección
3. @code-writer implementa
4. @qa-validator valida nuevamente

---

# FLUJO UNIFICADO QA

El qa-validator ahora integra las responsabilidades de unit-tester y e2e-validator.

Una vez que el build es exitoso, qa-validator:

1. **Clasifica el cambio** usando qa-decision-engine
2. **Determina qué pruebas ejecutar** según el tipo de cambio:
   - Unit tests (carga skill `unit-testing`)
   - E2E tests (carga skill `e2e-protocol`)
   - Ambos
   - Ninguno (solo build)
3. **Crea tests si no existen** (delegando a @code-writer)
4. **Ejecuta tests existentes**
5. **Diagnostica fallos** (distingue entre fallo del test y fallo de implementación)
6. **Reporta resultados consolidados**

⚠️ **REGLAS DE ORDEN:**
- **Unit tests SIEMPRE antes que E2E.** Si los unit tests fallan, no ejecutar E2E hasta que estén verdes.
- **Validación mínima de bootstrap:** Antes de tests E2E, verificar que la app responde con `curl http://localhost:4200 | grep "app-root"`. Si no responde, no ejecutar E2E.
- **webServer check:** Antes de cualquier test E2E, verificar que playwright.config.ts tiene `webServer` (Check 5). Si falta, delegar a code-writer.

Límites: máx 3 iteraciones build + máx 2 iteraciones por tipo de test.

---

*Este protocolo debe ser seguido estrictamente por @qa-validator. Referencias cruzadas: angular-architecture.md, e2e-protocol.md, unit-testing.md, qa-decision-engine.md*

## ⚠️ REGLA: NUNCA devolver resultado vacío

- Si el **build falla** → devolver el mensaje de error EXACTO con archivo y línea
- Si los **tests E2E fallan** → devolver la salida COMPLETA de Playwright (stdout + stderr) y el screenshot si existe
- Si un **comando no se puede ejecutar** → devolver "ERROR DE EJECUCIÓN: [comando] → [mensaje de error]"
- Si el **output está vacío** pero el comando se ejecutó → devolver "Comando ejecutado: [comando], Exit code: [código], Output: [vacío]"
- Bajo NINGUNA circunstancia devolver un resultado vacío, nulo, o "no se pudo determinar"
- Si no hay información suficiente → devolver al menos "ERROR INESPERADO: [descripción de lo que se intentó hacer]"