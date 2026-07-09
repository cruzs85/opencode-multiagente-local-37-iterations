---
name: build-scaffolding
description: Protocolo de validacion post-scaffolding para proyectos Angular
---

# Validacion Post-Scaffolding

Usar DESPUES de que code-writer ejecute `ng new`.

IMPORTANTE: `ng new` es la UNICA forma de crear el proyecto. Si falla, PREGUNTAR al usuario. NO crear archivos manualmente sin autorizacion.

## Pasos

1. build resuelve version de Angular CLI con Context7 y la pasa a code-writer.
2. code-writer crea el proyecto con `ng new` usando la version recibida de build. Todo en UNA SOLA LINEA bash.
3. Si `ng new` FALLA: build PREGUNTA al usuario que hacer (reintentar, probar otra version, detener).
4. Esperar a que code-writer termine completamente (task se resuelva) antes de continuar.
5. Delegar a qa-validator SOLO despues de que code-writer haya terminado: "Ejecuta npm run build"
6. Si el build FALLA: delegar a explorer para diagnosticar el error exacto
7. Si el error es de versiones (Node, TypeScript, etc.): delegar a code-writer para corregir, luego QA otra vez
8. Si falla 2 VECES: PREGUNTAR al usuario que hacer. No decidir por el.
9. Si el build PASA: continuar con la implementacion de componentes

## Limites
- Maximo 2 intentos de build post-scaffolding
- Si el build falla 2 veces, PREGUNTAR al usuario. No reintentar sin autorizacion.

## Verificacion de tests post-scaffolding

IMPORTANTE: NO configurar Vitest manualmente. El builder `@angular/build:unit-test` maneja todo:
- Genera `init-testbed.js` internamente (no necesita `test-setup.ts`)
- Resuelve `templateUrl`/`styleUrl` via el compilador Angular
- No necesita instalar `@angular/platform-browser-dynamic` (causa conflictos de peer deps)

Despues de `npm run build` exitoso, code-writer debe:
1. Ejecutar `ng test --watch=false` (via `npm run test -- --watch=false`).
2. Verificar que los tests del scaffold (`app.spec.ts`) pasan.
3. Si falla, reportar el error exacto y NO continuar con implementacion.

## Errores comunes
- Node version: Angular CLI 21.x requiere Node >= 22.22.3.
- Fallback Angular < 21: Si code-writer usa version anterior, detectar y PREGUNTAR al usuario.
- Proyecto manual: Si code-writer crea package.json/angular.json a mano, las configuraciones seran incorrectas. Detectar y PREGUNTAR.
- Tareas paralelas: NO ejecutar code-writer y qa-validator al mismo tiempo. Esperar que code-writer termine.
