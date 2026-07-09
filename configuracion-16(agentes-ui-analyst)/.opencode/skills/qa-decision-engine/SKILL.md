---
name: qa-decision-engine
description: Árbol de decisión para que qa-validator determine qué pruebas ejecutar según el tipo de cambio realizado. Úsalo después de un build exitoso para clasificar el cambio y seleccionar las estrategias de test apropiadas.
---

# OBJETIVO

Proveer un árbol de decisión determinístico que qa-validator sigue para:
1. Clasificar el cambio realizado (basado en archivos modificados)
2. Determinar si requiere unit tests, E2E tests, ambos o ninguno
3. Determinar si los tests existen, deben crearse o modificarse
4. Seleccionar y cargar las skills apropiadas

---

# ÁRBOL DE DECISIÓN PRINCIPAL

```
PASO 0: Build exitoso?
  NO → Delegar a @code-writer con el error exacto (archivo, línea, mensaje).
        Máx 2 intentos. NO auto-invocarse con task().
        Si persiste → escalar a @decomposer.
  SÍ → Continuar

PASO 1: Clasificar el cambio según archivos modificados

PASO 2: Para CADA tipo de test requerido:
   - Verificar existencia
   - Si no existe → Crear (delegar a @code-writer)
   - Si existe → Ejecutar
   - Si falla → Diagnosticar (distinguir fallo del test vs fallo de impl.)
   - Máx 2 iteraciones por tipo de test

PASO 3: Reportar resultados consolidados
```

---

# CLASIFICACIÓN DEL CAMBIO

## Método de clasificación

Leer los archivos modificados (usando git diff --name-only o leyendo los archivos que se acaban de crear/modificar) y clasificar según estas reglas:

| Patrón en archivos modificados | Clasificación | Tests requeridos |
|---|---|---|
| `*.html`, `*.scss`, `*.css` (solo plantilla/estilos) | `[solo-plantilla]` | Solo build ✓ |
| `*.service.ts`, `*.pipe.ts`, `*.directive.ts`, `*.guard.ts` | `[servicio-lógica]` | Unit tests |
| `*.component.ts` + `*.html` (cambios UI) | `[componente-visual]` | Unit tests + E2E |
| `canvas`, `requestAnimationFrame`, `game-loop` en archivos | `[game-loop-canvas]` | Unit tests + E2E |
| `*.config.ts`, `*.json`, `*.env`, `angular.json` | `[config/infra]` | Solo build ✓ |
| `*.routes.ts`, `app.routes.ts`, router-related | `[ruteo-navegación]` | E2E tests |
| `*.store.ts`, `state`, `signal()` en servicios | `[data-flow]` | Unit tests |
| No se puede clasificar (default) | `[no-clasificado]` | Unit tests + E2E (conservador) |
| Sin cambios (lectura/no-op) | `[sin-cambio]` | Solo build ✓ |

---

# LÓGICA DE EJECUCIÓN POR TIPO

## Para Unit Tests

```
1. Identificar el archivo spec correspondiente:
   - src/app/<misma-ruta>/<mismo-nombre>.spec.ts

2. ¿Existe?
   SÍ  → 3. Ejecutar: npx vitest run --testPathPattern=<spec>
          └── ¿Pasa?
              SÍ  → ✅ Unit OK
              NO  → Diagnosticar fallo UT
                    ├── Fallo del test → Editar .spec.ts (permitido) o delegar a @code-writer
                    └── Fallo impl.   → Delegar a @code-writer para corregir producción
                    └── Máx 2 intentos, luego BLOCKED
   NO  → Delegar a @code-writer: "Crear archivo <spec>"
          └── Luego ejecutar y diagnosticar igual que arriba

3. Cargar skill: 'unit-testing'
```

## Para E2E Tests

```
1. Identificar el archivo e2e spec correspondiente:
   - e2e/<funcionalidad>.spec.ts  o
   - src/<ruta>/<nombre>.e2e.spec.ts

2. ¿Existe?
   SÍ  → 3. Ejecutar: npx playwright test --grep=<patrón>
          └── ¿Pasa?
              SÍ  → ✅ E2E OK
              NO  → Diagnosticar fallo E2E
                    ├── Fallo del test (selector, ruta, mock) → Editar .spec o delegar a @code-writer
                    └── Fallo impl. (bug visual, lógica)    → Delegar a @code-writer para corregir prod.
                    └── Máx 2 intentos, luego BLOCKED
   NO  → Delegar a @code-writer: "Crear archivo e2e spec para <funcionalidad>"
          └── Luego ejecutar y diagnosticar igual que arriba

3. Limpieza post-E2E:
   npx kill-port 4200 2>/dev/null || true

4. Cargar skill: 'e2e-protocol'
```

---

# REGLAS DE DIAGNÓSTICO DIFERENCIAL

| Síntoma | Tipo test | Diagnóstico |
|---------|-----|-------------|
| `Property does not exist` / `is not a function` | Unit | **Fallo del test** — API desactualizada |
| `Expected X to equal Y` (valor obtenido ≠ esperado) | Unit | **Fallo de implementación** — lógica incorrecta |
| `NullInjectorError: No provider for` | Unit | **Fallo del test** — falta mock/provider |
| `Timed out 5000ms waiting for expect` | Unit | **Fallo del test** — async mal manejado |
| `locator: Timeout` / `Target closed` | E2E | **Fallo del test** — selector desactualizado |
| `Error: page.goto: net::ERR_*` | E2E | **Fallo de implementación** — ruta/servidor caído |
| Screenshot muestra UI incorrecta (layout, datos) | E2E | **Fallo de implementación** — bug visual/lógica |
| Screenshot muestra página en blanco / 404 | E2E | **Fallo de implementación** — ruta no configurada |

---

# REGLA ANTI-RECURSIÓN (OBLIGATORIO)

El qa-validator **NUNCA** debe auto-invocarse con task().

Si el build falla:
1. Delegar a @code-writer con el error exacto
2. Re-ejecutar build
3. Máx 2 iteraciones
4. Si persiste → escalar a @decomposer
5. NUNCA llamar a task() con subagent_type = "qa-validator"

---

# FORMATO DE REPORTE CONSOLIDADO

```
Build: ✅ exitoso | ❌ fallido
Clasificación: [tipo]
Unit tests:  ✅ | ❌ | ⏭️ saltado  — <detalle>
E2E tests:   ✅ | ❌ | ⏭️ saltado  — <detalle>
Limpieza:    ✅ servidor detenido | ❌ no aplica
```

---

# FLUJO COMPLETO

```
Build OK
  │
  ├→ Clasificar cambio
  │     │
  │     ├→ [solo-plantilla]  ───→ Reportar ✅ (solo build)
  │     ├→ [servicio-lógica] ───→ Unit tests
  │     ├→ [componente-visual] ─→ Unit tests + E2E
  │     ├→ [game-loop-canvas] ──→ Unit tests + E2E
  │     ├→ [config/infra]    ───→ Reportar ✅ (solo build)
  │     ├→ [ruteo]           ───→ E2E
  │     ├→ [data-flow]       ───→ Unit tests
  │     └→ [no-clasificado]  ───→ Unit tests + E2E
  │
  └→ Ejecutar tests según clasificación
       │
       ├→ ¿Existe test?
       │    ├→ No  → Crear (delegar code-writer)
       │    └→ Sí  → Ejecutar
       │              ├→ Pasa  → ✅
       │              └→ Falla → Diagnosticar
       │                         ├→ Fallo test → Modificar test (editar spec o delegar)
       │                         └→ Fallo impl. → Corregir prod.
       │
       └→ Máx 2 iteraciones por tipo
            └→ Persiste → BLOCKED + escalar a decomposer
            └→ NUNCA auto-invocarse con task(qa-validator)
```

---

# SKILLS A CARGAR

| Decisión | Skill a cargar |
|------|-----------|
| Unit tests | `unit-testing` |
| E2E tests | `e2e-protocol` |
| Ambos | `unit-testing` + `e2e-protocol` |
| Ninguno | Solo `qa-protocol` |
```
