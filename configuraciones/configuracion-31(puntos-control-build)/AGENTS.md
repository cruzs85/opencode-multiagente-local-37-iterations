# Dinosaur Runner — Sistema de Agentes OpenCode

## Arquitectura

Sistema multi-agente minimalista con Context7 para documentación actualizada.

## Agentes

| Agente | Modelo | Rol |
|--------|--------|-----|
| **build** (primary) | `opencode-go/kimi-k2.6` | Orquestador. Usa `^21.0.0`, orquesta scaffolding, planificacion y ejecucion. |
| **decomposer** | `ollama/model-agent-base` | Planificador. Investiga proyecto real (carga project-exploration), luego desglosa objetivos en tareas (carga task-decomposition). |
| **code-writer** | `ollama/model-agent-base` | Escribe y modifica archivos. No resuelve versiones ni planifica. |
| **qa-validator** | `ollama/model-agent-base` | Build + tests unitarios + E2E. Crea/corrige *.spec.ts. |
| **explorer** | `ollama/qwen3:32b` | Búsquedas y diagnóstico (6 toolcalls). Solo lectura. |

## Constantes de versión

| Constante | Valor |
|-----------|-------|
| `ANGULAR_VERSION` | `^21.0.0` (npx resuelve la ultima 21.x automaticamente) |
| `ANGULAR_CLI` | `npx @angular/cli@^21.0.0` |
| `NODE_VERSION` | `22.x` (LTS) |

> **Regla 1**: Todo scaffolding debe ejecutarse con `npx @angular/cli@^21.0.0`. code-writer ejecuta ng new, luego npm run build, y verifica con ng test --watch=false. Si la version 21.x no existe en npm, PREGUNTAR al usuario.
> **Regla 2**: El modelo NO debe hardcodear `21.0.0` ni ninguna versión específica en package.json. Usa `^21.0.0`.
> **Regla 3**: Después de `ng new`, verificar que el proyecto compila con `npm run build` antes de continuar. Si falla 2 veces, PREGUNTAR al usuario que hacer.
> **Regla 4**: NO hacer fallback a versiones anteriores de Angular. Si Angular 21 no funciona, PREGUNTAR al usuario que hacer (probar otra version, cambiar configuracion, o detener).
> **Regla 5**: Usar los defaults de Angular 21 (Vitest, zoneless, standalone). No intentar forzar Karma/Jasmine o Zone.js.
> **Regla 6**: source + nvm + comando deben ir en UNA sola linea de bash (cada bash call es un shell separado). Usar patron condicional: `source ~/.nvm/nvm.sh && (nvm use 22 || (nvm install 22 && nvm use 22)) && <comando>`. Los agentes que ejecuten ng/npm/npx deben cargar la skill `node-setup`. Para build usar `npm run build`. Para tests usar `ng test --watch=false` (via `npm run test -- --watch=false`). NO usar `npx vitest run` directamente.
> **Regla 7**: Si `ng new` falla por cualquier causa, PREGUNTAR al usuario que hacer. NO crear proyecto manualmente sin autorizacion. NO hacer `ng update` para subir de versión.
> **Regla 8**: code-writer tiene máximo 8 toolcalls por tarea y 64K de contexto. El orquestador NO debe mandar más de 3 archivos por `task()`. Dividir proyectos grandes en tareas separadas. NO ejecutar tareas de code-writer en paralelo si comparten dependencias.
> **Regla 9**: NO ejecutar qa-validator mientras code-writer esté activo. Esperar a que code-writer termine antes de build/tests.
> **Regla 10**: code-writer NUNCA ejecuta builds o tests. Eso es responsabilidad exclusiva de qa-validator.
> **Regla 11**: qa-validator DEBE usar `Read` tool para leer templates HTML antes de escribir tests E2E. No inventar selectores ni textos.

## Post-Scaffolding Validation

0. **`ng new` es obligatorio**. Si falla, PREGUNTAR al usuario que hacer. No crear proyecto manualmente sin autorizacion.
1. **`npm run build` debe pasar** limpio. Si no, reportar error y no continuar.
2. **`ng test --watch=false`** debe pasar. El builder `@angular/build:unit-test` maneja la configuracion de Vitest internamente. No crear vitest.config.ts ni test-setup.ts manualmente.
3. Si el build falla por incompatibilidad de versiones (TypeScript, Zone.js, etc.), consultar Context7 para resolver las versiones correctas.
4. Si Context7 no puede resolver o el build falla 2 veces, **preguntar al usuario** — no decidir por el.

## Planificación (decomposer)

El agente **decomposer** es el encargado de investigar el proyecto real y desglosar objetivos en tareas. En una sola task:
1. Carga la skill `project-exploration` y explora archivos reales (glob, read)
2. Carga la skill `task-decomposition` y produce el plan basado en la estructura real

Build pasa el objetivo del usuario a decomposer, recibe el plan, y ejecuta cada paso secuencialmente.

## Context7 MCP

Context7 está disponible para consultar sintaxis o documentación de Angular/Playwright cuando sea necesario. code-writer puede usarlo para verificar API de signals, zoneless, testing, etc. (NO para resolver versiones).

## Skills

| Skill | Propósito | Cargada por |
|-------|-----------|-------------|
| anti-loop-protocol | Detección de bucles infinitos | code-writer, qa-validator |
| angular-patterns | Reglas estrictas de código Angular (ViewChild, signals, vi.fn(), eventos, archivos protegidos) | code-writer (auto-load al inicio) |
| angular-architecture | Convención de nombrado Angular 21+ (con sufijo .component) | code-writer, qa-validator |
| build-scaffolding | Protocolo de validación post-scaffolding (build, fallo, aborto) | build |
| node-setup | Patrón nvm/source/bash para comandos ng/npm/npx en una sola línea | code-writer, qa-validator |
| project-exploration | Investigación de proyecto scaffolded (estructura real, configs, convenciones) | decomposer |
| task-decomposition | Protocolo de descomposición de objetivos en tareas secuenciales/paralelas | decomposer |
| ui-design-system | Sistema de diseño Dark Neon (colores, tipografía, efectos) | code-writer |

## Flujo de trabajo

```
Usuario -> build (kimi-k2.6)

  FASE 1: SCAFFOLDING
  +-> task(code-writer, "Crea proyecto Angular 21 con npx @angular/cli@^21.0.0")
  |    code-writer: ng new -> npm run build -> ng test --watch=false

  FASE 2: PLANIFICACION CON INVESTIGACION
  +-> task(decomposer, "Investiga proyecto en [path] y planifica: [objetivo]")
  |    decomposer: project-exploration -> task-decomposition -> PLAN

  FASE 3: EJECUCION DEL PLAN
  +-> ejecuta Paso 1: task(code-writer, ...)
  +-> ejecuta Paso 2: task(code-writer, ...)
  +-> ...
  +-> ejecuta Paso N: task(qa-validator, "Ejecuta npm run build && npm run test -- --watch=false")
  +-> (task(explorer, ...) puede ir en paralelo si es solo diagnostico)
```

Build ejecuta las fases en orden. decomposer investiga la estructura real antes de planificar, eliminando la necesidad de un agente separado de inspeccion.

## Modelos

Todos los subagentes usan `model-agent-base`, un modelo Ollama basado en `qwen3-coder:30b` con:
- `num_ctx: 65536` (contexto grande)
- `temperature: 0` (determinista para código)
- `top_k: 20, top_p: 0.8, repeat_penalty: 1.05`

Crear con: `ollama create model-agent-base -f .opencode/models/modelfile-agent-base`
