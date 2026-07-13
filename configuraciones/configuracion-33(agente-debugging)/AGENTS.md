# Dinosaur Runner — Sistema de Agentes OpenCode

## Agentes

| Agente | Modelo | Rol |
|--------|--------|-----|
| **build** (primary) | `opencode-go/kimi-k2.6` | Orquestador. Scaffolding, planificacion y ejecucion secuencial. |
| **decomposer** | `ollama/model-agent-base` | Planificador. Investiga proyecto real (convenciones + disco) y desglosa objetivos en tareas. |
| **code-writer** | `ollama/model-agent-base` | Escribe y modifica archivos. Puede ejecutar build/test para verificar compilacion. NO crea tests. |
| **qa-validator** | `ollama/model-agent-base` | Build + tests unitarios + E2E. Crea/corrige *.spec.ts. |
| **explorer** | `ollama/model-agent-base` | Busquedas y diagnostico RAPIDO. Solo lectura, sin razonamiento. |
| **debugging** | `ollama/model-debugging` | Analisis de causa raiz de bugs COMPLEJOS. Solo lectura + razonamiento. |

## Constantes

| Constante | Valor |
|-----------|-------|
| `ANGULAR_VERSION` | `^21.0.0` |
| `ANGULAR_CLI` | `npx @angular/cli@^21.0.0` |
| `NODE_VERSION` | `22.x` |

## Reglas

1. Todo scaffolding con `npx @angular/cli@^21.0.0`. Si falla, PREGUNTAR al usuario.
2. NO hardcodear versiones especificas en package.json. Usar `^21.0.0`.
3. Despues de `ng new`: `npm run build` debe pasar. Si falla 2 veces, PREGUNTAR.
4. NO hacer fallback a Angular < 21. Si Angular 21 no funciona, PREGUNTAR.
5. Usar defaults de Angular 21: Vitest, zoneless, standalone.
6. `source + nvm + comando` en UNA sola linea de bash (cada bash call es shell separado).
7. code-writer: max 8 toolcalls, max 3 archivos por task, NO paralelizar con dependencias compartidas.
8. code-writer NO crea tests (*.spec.ts, *.e2e.spec.ts). Eso es de qa-validator.
9. code-writer PUEDE ejecutar npm run build/test para verificar compilacion.
10. NO ejecutar qa-validator mientras code-writer esta activo.
11. qa-validator DEBE usar `Read` tool para leer templates HTML antes de escribir tests.
12. No reescribir un archivo mas de 2 veces seguidas. Si sigue fallando, reportar a build.
13. Respetar la estructura del proyecto (seccion "Estructura del proyecto" abajo). NO crear archivos en ubicaciones incorrectas.
14. Antes de crear un archivo, verificar con glob que no exista ya. Si existe, MODIFICARLO.
15. code-writer NUNCA debe crear stubs ni archivos dummy. Reportar error exacto a build.

## Estructura del proyecto
```
dino-runner/
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   └── app/
│       ├── app.ts, app.config.ts, app.routes.ts, app.html, app.scss
│       ├── welcome/         welcome.component.ts, .html, .scss, .spec.ts
│       ├── game/            game.component.ts, .html, .scss, .spec.ts
│       ├── game-over/       game-over.component.ts, .html, .scss, .spec.ts
│       └── services/        game.service.ts, high-score.service.ts
├── e2e/
│   ├── welcome.e2e.spec.ts
│   ├── game.e2e.spec.ts
│   └── game-over.e2e.spec.ts
├── angular.json
├── package.json
├── playwright.config.ts
└── tsconfig*.json
```

## Skills

| Skill | Proposito | Cargada por |
|-------|-----------|-------------|
| angular-patterns | Reglas Angular 21 (signals, mocks, @if/@for, inject(), tests) | code-writer (obligatorio al inicio), qa-validator, decomposer, debugging |
| node-setup | Patron nvm/source para comandos npm/npx | code-writer, qa-validator (al usar npm), decomposer
| ui-design-system | Sistema de diseno Dark Neon | code-writer (al crear componentes visuales) |

## Flujo

```
Usuario -> build
  FASE 1 - SCAFFOLDING:
    task(code-writer, ng new -> build -> test)
    task(explorer, verificacion rapida: existe src/app/? 3 toolcalls)
    -> pasa a FASE 2 (sin re-verificar)

  FASE 2 - PLANIFICACION (una sola task, confianza):
    task(decomposer, investiga + planifica)
    NO explorer antes/despues. decomposer lee por si mismo.
    Build confia en el plan. No lo verifica.

  FASE 3 - EJECUCION DEL PLAN (paso a paso):
    task(code-writer, ...) -> code-writer verifica con build
    [BUILD: qa-validator verifica build]
    ...
  FINAL: qa-validator crea tests + ejecuta suite final

DIAGNOSTICO (solo cuando falla):
  Error simple (archivo no encontrado, typo):
    -> task(explorer, ...) -> build ajusta
  Error complejo (type mismatch, logica, test sin causa):
    -> task(debugging, ...) -> build recibe diagnostico -> code-writer corrige
  NO re-verificar despues de corregir. Ejecutar build/test directo.
```
