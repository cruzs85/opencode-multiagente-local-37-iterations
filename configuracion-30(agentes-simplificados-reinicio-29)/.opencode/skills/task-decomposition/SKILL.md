---
name: task-decomposition
description: Protocolo para desglosar objetivos en tareas secuenciales/paralelas con dependencias
---

# Task Decomposition Protocol

## Goal
Desglosar objetivos grandes en tareas pequeñas, secuenciales y ejecutables por code-writer (max 8 toolcalls, 64K contexto).

## Dependency Rules (orden obligatorio)
1. **Scaffolding first**: `ng new` es SIEMPRE el paso 1, solitario. Despues de ng new, verificar vitest.config.ts con globals:true antes de continuar.
2. **Services before components**: SIEMPRE crear servicios primero, componentes despues. Un servicio .ts + su interfaz/types .ts en la misma task.
3. **Components before UI tests**: todos los componentes (TS + HTML + CSS completos) DEBEN existir antes de escribir tests unitarios o E2E.
4. **Tests unitarios ANTES que E2E**: los spec.ts se crean solo cuando servicios y componentes tienen su API real. NUNCA escribir tests contra placeholders (<h1> temporal).
5. **E2E tests ULTIMO paso de codigo**: los tests E2E se escriben SOLO cuando todos los componentes tienen su HTML final con botones, titulos y elementos reales renderizados.
6. **Build/test final**: `npm run build` y `npm run test` se ejecutan SOLO despues de que todo el codigo y tests estan escritos.

## Task Size Limits
- Maximo 3 archivos por task a code-writer
- Servicios: maximo 2 archivos por task (.ts + .spec.ts)
- Si un componente requiere >3 archivos (ej: .ts + .html + .scss + .spec.ts), dividir en 2 tasks
  - Task A: .ts + .html + .scss (implementacion)
  - Task B: .spec.ts (tests)

## Parallel Execution Rules
- NO paralelizar tareas que compartan imports o dependencias
- NO paralelizar code-writer con qa-validator (build/tests)
- SI paralelizar explorer con cualquier tarea (solo lectura, no modifica)
- SI paralelizar multiples tasks de code-writer SOLO si son independientes (sin imports compartidos)
  - Ejemplo SI: welcome.component + game-over.component (no se importan entre si)
  - Ejemplo NO: game.service + game.component (game.component importa game.service)

## Output Format
Siempre producir el plan en este formato exacto:

PLAN:
  Paso 1: code-writer - [descripcion]
    Archivos: [lista de rutas]
    Depende de: ninguno
    
  Paso 2: code-writer - [descripcion]
    Archivos: [lista de rutas]
    Depende de: Paso 1
    
  ...
  Paso N: qa-validator - Ejecutar npm run build y npx vitest run
    Depende de: [ultimo paso de code-writer]
