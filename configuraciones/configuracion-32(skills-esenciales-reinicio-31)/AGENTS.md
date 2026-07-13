# Dinosaur Runner — Sistema de Agentes OpenCode

## Agentes

| Agente | Modelo | Rol |
|--------|--------|-----|
| **build** (primary) | `opencode-go/kimi-k2.6` | Orquestador. Scaffolding, planificacion y ejecucion secuencial. |
| **decomposer** | `ollama/model-agent-base` | Planificador. Investiga proyecto real (convenciones + disco) y desglosa objetivos en tareas. |
| **code-writer** | `ollama/model-agent-base` | Escribe y modifica archivos. Puede ejecutar build/test para verificar compilacion. NO crea tests. |
| **qa-validator** | `ollama/model-agent-base` | Build + tests unitarios + E2E. Crea/corrige *.spec.ts. |
| **explorer** | `ollama/qwen3:32b` | Busquedas y diagnostico. Solo lectura. |

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

## Skills

| Skill | Proposito | Cargada por |
|-------|-----------|-------------|
| angular-patterns | Reglas Angular 21 (signals, mocks, @if/@for, inject(), tests) | code-writer (obligatorio al inicio), qa-validator, decomposer |
| node-setup | Patron nvm/source para comandos npm/npx | code-writer, qa-validator (al usar npm), decomposer
| ui-design-system | Sistema de diseno Dark Neon | code-writer (al crear componentes visuales) |

## Flujo

```
Usuario -> build
  FASE 1: task(code-writer, scaffolding -> ng new -> build -> test)
  FASE 2: task(decomposer, investigar + planificar)
  FASE 3: ejecutar PLAN paso a paso:
    task(code-writer, ...) -> code-writer verifica con build -> task(code-writer, ...) -> ...
    [BUILD: qa-validator verifica build independiente]
  FINAL:  qa-validator crea tests + ejecuta suite final (build + unit + E2E)
```
