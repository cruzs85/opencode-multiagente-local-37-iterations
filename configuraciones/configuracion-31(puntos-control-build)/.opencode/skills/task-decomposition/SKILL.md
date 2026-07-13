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
6. **Build checkpoints (incremental)**: Inserta [BUILD] despues de grupos que formen un grafo de dependencias completo y compilable:
   - [BUILD] 1 — despues de servicios/modelos: no dependen de componentes, compilan solos
   - [BUILD] 2 — despues de cada componente o grupo de componentes independientes (sin imports cruzados)
   - [BUILD] 3 — despues de todos los componentes: verifica integracion completa (routing, app.component)
   - NO insertar [BUILD] si el grupo tiene dependencias sin crear (ej: componente sin su servicio)
7. **Tests despues de build**: Solo crear tests unitarios despues de que todos los [BUILD] de implementacion pasan
8. **Build/test final**: `npm run build` + `npm run test` + E2E al final, incluso si los checkpoints intermedios pasaron

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
Siempre producir el plan en este formato exacto. Usa `[BUILD]` entre pasos para marcar checkpoints de compilacion:

```
PLAN:
  Paso 1: code-writer - Crear GameService y modelo Obstacle
    Archivos: src/app/services/game.service.ts, src/app/models/obstacle.ts
    Depende de: ninguno

  [BUILD]

  Paso 2: code-writer - Crear GameComponent
    Archivos: src/app/game/game.component.ts, src/app/game/game.component.html
    Depende de: Paso 1

  [BUILD]

  Paso 3: code-writer - Crear WelcomeComponent + GameOverComponent
    Archivos: src/app/welcome/welcome.component.ts, src/app/game-over/game-over.component.ts
    Depende de: Paso 2

  [BUILD]

  Paso 4: qa-validator - Crear tests unitarios para GameService y GameComponent
    Depende de: Paso 3

  Paso 5: qa-validator - Ejecutar build final + tests unitarios + E2E
    Depende de: Paso 4
```

Reglas para colocar [BUILD]:
- Despues de servicios: compilan solos, detecta errores de DI temprano
- Despues de cada componente "hoja": no tiene dependencias de otros componentes
- Despues de componente "contenedor" (app.component + routing): verifica integracion
- NO poner [BUILD] entre un componente y su test (el test necesita el build primero)
- NO poner [BUILD] entre archivos del mismo componente (.ts y .html van juntos)
