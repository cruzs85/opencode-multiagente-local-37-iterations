---
name: project-exploration
description: Protocolo de investigacion de proyecto Angular scaffolded para decomposer
---

# Project Exploration Protocol

## Objetivo
Investigar un proyecto Angular recien scaffolded (estructura real, configuraciones, convenciones) y producir un resumen estructurado que sirva de base para el plan de tareas.

## Como usar
Cargar esta skill al inicio de una tarea de decomposer. Investigar PRIMERO, planificar DESPUES.

## Pasos de investigacion

1. **NO asumir estructura**. No uses skills (angular-architecture, etc.) como fuente de verdad sobre archivos existentes. Lee los archivos reales.

2. **Leer configuraciones raiz** (desde la raiz del proyecto Angular):
   - `package.json`: versiones de @angular/core, @angular/cli, test runner (Vitest? Karma?)
   - `angular.json`: prefix, builder, SSR, styles format
   - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`: compilacion y tipos
   - `vitest.config.ts` o `vite.config.ts`: verificar `globals: true`

3. **Verificar estructura real de src/app/**:
   - `ls src/app/` y glob `src/app/**/*.ts`
   - Leer `src/app/app.ts`, `src/app/app.config.ts`, `src/app/app.routes.ts`
   - Verificar: zoneless? `provideZonelessChangeDetection` en app.config?
   - Verificar: standalone? routing provider?

4. **NO inventar archivos**. Si lees `angular-architecture` que describe `welcome/`, `game/`, `services/`, NO los reportes como existentes. Solo reporta lo que realmente ves en el disco.

5. **Producir resumen estructurado**:
   ```
   VERSION SUMMARY:
     Angular version: [version exacta de @angular/core en package.json]
     Angular CLI version: [version exacta de @angular/cli en package.json]
     Test runner: [Vitest / Karma / Jasmine]
     Change detection: [zoneless / zone.js]
     Build system: [@angular/build / webpack / esbuild]
     Standalone: [yes / no]
     SSR: [yes / no]

   PROJECT STRUCTURE:
     [solo archivos y directorios que realmente existen]

   CONFIG PECULIARITIES:
     - Vitest globals: [yes/no]
     - Zoneless: [yes/no]
     - [cualquier config inusual]

   EXISTING FILES:
     [solo lo que leiste, enumerado]
   ```

## Limites
- Maximo 8 toolcalls para investigacion
- NO modificar archivos
- NO ejecutar builds
- NO ejecutar tests

## Errores comunes
- Reportar componentes que no existen (welcome/game/game-over) porque estan en skills de arquitectura. VERIFICAR existencias con glob/ls antes de mencionar cualquier archivo.
- Asumir estructura de servicios. Solo existen si los ves en el disco.
- No verificar vitest.config.ts. Es critico para que los tests funcionen.
