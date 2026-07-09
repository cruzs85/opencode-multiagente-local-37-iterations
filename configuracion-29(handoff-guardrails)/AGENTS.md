# Dinosaur Runner — Sistema de Agentes OpenCode

## Arquitectura del Sistema

Este proyecto utiliza un sistema multi-agente orquestado por OpenCode AI. Cada agente tiene un rol especializado y permisos específicos para garantizar un flujo de trabajo seguro, eficiente y libre de bucles infinitos.

La comunicación entre agentes se realiza mediante **handoff JSON** en `/tmp/handoff/{session_id}/`. Cada agente recibe de build la ruta exacta al archivo handoff; ningún agente descubre rutas por sí mismo. Ver `.opencode/skills/handoff-protocol/SKILL.md` para el detalle completo.

[Diagrama de arquitectura]
Orquestador(build) → Decomposer → ui-designer → Code Writer → Verifier → QA Validator ✅
Además: Explorer, Analyst, Researcher, Package Manager

## ⚠️ Entorno de Ejecución — Máquina Local con Escritorio

IMPORTANTE: Este proyecto se ejecuta en una máquina local con monitor, teclado y escritorio gráfico (X11), NO en un servidor headless remoto.

Regla: NO instalar herramientas de visualización remota (VNC, Xvfb). Usar `npx playwright test --headed` directamente.

## Modelos de Agentes

| Agente | Modelo | Propósito |
|---|---|---|
| Orquestador (build) | `opencode-go/kimi-k2.6` | Punto de entrada. Delega, nunca edita ni ejecuta bash. |
| Decomposer | `ollama/qwen3:32b` | Arquitecto técnico. Descompone tareas en pasos atómicos. |
| Explorer | `ollama/qwen3-coder:30b` | Localizador técnico. Ejecuta comandos de exploración. |
| Researcher | `ollama/qwen3-coder:30b` | Investiga APIs REST externas. |
| Analyst | `ollama/qwen3:32b` | Analista de codebase. Flujos, arquitectura, dependencias. |
| UI Designer | `ollama/qwen3:32b` (ctx 40960, temp 0.1) | Diseña interfaces. Produce specs JSON. No es modelo de código — produce descripciones estructurales, no archivos. |
| Code Writer | `model-code-writer` (ollama/qwen3-coder:30b con ctx 32768, temp 0) | Escribe archivos. Solo escribe. |
| Verifier | `model-verifier` (ollama/qwen3-coder:30b con ctx 32768, temp 0) | Verifica código post-escritura. |
| QA Validator | `model-qa-validator` (ollama/qwen3-coder:30b con ctx 32768, temp 0.1) | Build + tests unitarios + E2E. |
| Package Manager | `ollama/qwen3-coder:30b` | Instala paquetes Angular. |

## Agentes Disponibles

### 1. Orquestador (build) — opencode-go/kimi-k2.6
Rol: Punto de entrada. Descompone tareas complejas y delega a subagentes siguiendo el árbol de decisiones del `orchestrator-protocol`.
Regla suprema: No edita código ni ejecuta bash. Solo task() y skill().
Permisos: task.* permitido, edit denegado, bash denegado.
Skills que DEBE cargar: `orchestrator-protocol` (antes de delegar), `handoff-protocol`, `anti-loop-protocol`, `partial-edit-protocol`, `post-implementation`, `notifications`.
Handoff: **build nunca escribe handoffs.** Usa task() directo por defecto. Handoff solo cuando un subagente produjo output para otro — build pasa solo la ruta. build delega la creación del directorio raíz `/tmp/handoff/{session_id}/` a code-writer solo cuando inicia una cadena de handoff.

### 2. Decomposer — ollama/qwen3:32b
Rol: Arquitecto técnico. Descompone tareas complejas en pasos atómicos.
Reglas: Prohibido lenguaje ambiguo. Verbos concretos (crear, modificar, añadir). NUNCA escribe código.
Permisos: task denegado, edit denegado, bash denegado.
Skills: `task-decomposition`, `anti-loop-protocol`.
Handoff: No produce handoff JSON. build lee su respuesta en texto plano y genera los handoffs.

### 3. Explorer — ollama/qwen3-coder:30b
Rol: Localizador técnico. Encuentra archivos, funciones, rutas, tablas. Ejecuta comandos.
Clasificación: TIPO A (ejecución), TIPO B (búsqueda rápida).
Permisos: edit denegado, bash permitido (node, node -e, head, wc, cat, ls, echo, db-query), webfetch denegado.
Límites: Máximo 2 toolcalls por tarea, máximo 1 reintento. NO hace análisis profundo.
Skills: NO carga skills de análisis (anti-loop-protocol es opcional).

### 4. Researcher — ollama/qwen3-coder:30b
Rol: Investiga APIs REST externas y propone interfaces de servicios Angular.
Permisos: edit denegado, bash denegado, webfetch permitido, websearch permitido.
Límite: No investiga librerías de UI (PrimeNG, Angular Material). Eso lo hace @ui-designer.
Skills: No carga skills específicas (puede cargar anti-loop-protocol).

### 5. Analyst — ollama/qwen3:32b
Rol: Analista de codebase. Analiza flujos, arquitectura, dependencias y estructura multi-archivo.
Responsabilidades: análisis estructurado TIPO C, generar informes con fingerprint, trazar relaciones entre componentes.
Carga SIEMPRE: `analyst-protocol` y `anti-loop-protocol`. Si requiere MySQL, también `mysql`.
Permisos: edit denegado, bash permitido (node, node -e, head, wc, cat, ls, echo, find — solo lectura), webfetch permitido.

### 6. UI Designer — model-ui-designer
Rol: Diseña pantallas y componentes visuales. Investiga librerías UI (PrimeNG, Angular Material) y produce especificaciones JSON estructurales para code-writer. NUNCA escribe código (.ts, .html, .scss).
Flujo:
  1. Carga `ui-design-system`, `handoff-protocol`, `anti-loop-protocol`
  2. Adicionalmente puede cargar `angular-architecture`, `angular-patterns`, `design-verification`
  3. Investiga con webfetch la documentación oficial del componente
  4. Si la librería no está instalada, DELEGA a @package-manager (vía build)
  5. Produce especificación JSON por componente en `/tmp/handoff/{session_id}/code-writer{timestamp}/tareaN.json`
  6. Máximo 3 specs totales, 5 toolcalls por componente
Permisos: edit denegado, bash permitido solo para handoff (mkdir, cat >, ls, ls -la, echo en /tmp/handoff/). PROHIBICIÓN ABSOLUTA: node -e writeFileSync permitido solo en /tmp/handoff/, DENEGADO en src/ y cualquier otra ruta. webfetch permitido, websearch permitido. task NO permitido (delega a code-writer/package-manager a través de build).

### 7. Code Writer — model-code-writer
Rol: Ejecutor de archivos. SOLO escribe. NO verifica nada.
Reglas: Usa método de 2 pasos SIEMPRE: (1) `cat > /tmp/handoff/source.ts << 'ENDOFFILE'` para el contenido sin escapes, (2) `node -e "require('fs').writeFileSync('ruta', require('fs').readFileSync('/tmp/handoff/source.ts','utf8'))"` para escribirlo. `edit` para cambios parciales. Verificar con `wc -c` después de cada escritura.
Límites: Máximo 5 toolcalls por tarea. NO usa task(), question(), ni lee archivos que acaba de escribir.
Skills que DEBE cargar: `handoff-protocol`, `anti-loop-protocol`, `json-safe-edit`.
Permisos: edit permitido, bash permitido (mkdir -p *, cat > *, node -e *, ls *, wc *, cd, echo).
Handoff: Lee handoff JSON de entrada (spec-ui o plan-logica). Al completar, escribe handoff para verifier en `/tmp/handoff/{session_id}/verifier{timestamp}/tarea1.json`.
⚠️ E2E TESTS: Siempre en `e2e/`, NUNCA en `src/app/`. Antes de escribir tests E2E, verificar que `playwright.config.ts` tenga `testMatch: '**/*.e2e.spec.ts'` y `testDir: './e2e'`. Si falta, corregirlo.
⚠️ CANVAS: No usar selectores como `.dinosaur` — los elementos `<canvas>` no tienen sub-elementos DOM. Usar solo selectores DOM reales (`.score`, botones, etc.) o `page.evaluate()`.

### 8. Verifier — model-verifier
Rol: Validador de implementación. Verifica contratos, imports, patrones Angular.
Responsabilidades: contract-verification, post-write-verification, angular-architecture, integration-verification, game-loop-patterns, design-verification.
Límites: Máximo 6 toolcalls, MAX 3 SKILL LOADS por tarea, máximo 2 iteraciones verificación-corrección.
Skills que DEBE cargar: `handoff-protocol`, `anti-loop-protocol`, `post-write-verification`, `error-routing` (condicional, solo si hay bugs). NO cargar skills condicionales a menos que el handoff lo solicite. Skills no permitidas (con `"*": "deny"`): bootstrap-diagnostics, qa-decision-engine, qa-protocol, unit-testing, e2e-protocol, post-implementation, orchestrator-protocol, json-safe-edit, analytics, bug-investigation, notifications, customize-opencode, task-decomposition.
Permisos: edit denegado, bash permitido solo para handoffs (mkdir, node -e writeFileSync, ls, wc, echo en /tmp/handoff). read/glob/grep permitido. Skill permissions: `"*": "deny"` con allowlist explícita.
Handoff: Lee handoff de code-writer (tipo "verificacion"). Al completar, escribe handoff para qa-validator en `/tmp/handoff/{session_id}/qa-validator{timestamp}/tarea1.json`.
⚠️ IMPORTANTE: build NUNCA debe incluir contenido del handoff en el prompt. Solo pasa la ruta. Si build incluye listas/verificaciones, el verifier ignora el handoff JSON y rompe el protocolo.

### 9. QA Validator — model-qa-validator
Rol: Valida cambios ejecutando build + tests unitarios + tests E2E. Decide autónomamente qué pruebas ejecutar según el cambio (usa qa-decision-engine).
Capacidades:
- Build (npm run build)
- Tests unitarios (npm test) — crea, ejecuta o modifica *.spec.ts según sea necesario
- Tests E2E (npx playwright test) — crea, ejecuta o modifica *.e2e.spec.ts según sea necesario
Edit: solo *.spec.ts y *.e2e.spec.ts (crear o corregir tests). PROHIBIDO tocar archivos de implementación.
Skills: `qa-protocol`, `qa-decision-engine`, `error-routing`, `unit-testing`, `e2e-protocol`, `angular-architecture`, `angular-patterns`, `anti-loop-protocol`, `handoff-protocol`, `agent-scope-limits`, `bootstrap-diagnostics`.
Límites: 3 iteraciones build + 2 iteraciones por tipo de test. Máximo 10 toolcalls.
Permisos: edit permitido solo en *.spec.ts y *.e2e.spec.ts (deny en todo lo demás). bash permitido para npm run build, npm test, npx playwright test, npm run lint, kill-port, comandos de sistema (ls, lsof, kill, mkdir, cat, echo, node -e, touch, wc, wc -l, ps, find, grep, test) y handoffs. task NO permitido.
⚠️ DIAGNÓSTICO JIT MODE: Si `npx playwright test` falla con `Standard Angular field decorators are not supported in JIT mode`, la causa es que `testMatch`/`testDir` en `playwright.config.ts` está mal configurado (Playwright procesa unit tests como E2E). Delegar a code-writer: añadir `testDir: './e2e'` y `testMatch: '**/*.e2e.spec.ts'`.

### 10. Package Manager — ollama/qwen3-coder:30b
Rol: Instala paquetes Angular. Recibe instrucciones del orquestador o de @ui-designer (vía build).
Bash: npm install, npm ci, npm run, npx, ng, node -e, y comandos de sistema (ls, find, mkdir, cp, mv, rm, cat) permitidos.
Límite: No investiga qué instalar, solo ejecuta la instalación.
Skills: `angular-architecture`, `angular-scaffolding`, `angular-packages`, `anti-loop-protocol`, `scaffolding-verification`.

## Skills del Sistema

| Skill | Propósito | Cargada por |
|---|---|---|
| agent-scope-limits | Límites de alcance para correcciones (mínimo cambio, sin refactors no solicitados) | QA Validator |
| analyst-protocol | Análisis estructurado multi-archivo | Analyst |
| angular-architecture | Patrones Angular (standalone, signals, inject, afterNextRender, DestroyRef, event listener cleanup) | UI Designer, Code Writer, Verifier, QA Validator, Package Manager |
| angular-packages | Dependencias Angular — instalación y configuración | Package Manager |
| angular-patterns | Reglas estrictas de sintaxis Angular (control flow v17+, styleUrl, signals inmutabilidad, event listeners, magic numbers) | UI Designer, Code Writer, Verifier, QA Validator |
| angular-scaffolding | Crear proyecto Angular en directorio ocupado (estrategia .ng-temp) | Package Manager |
| scaffolding-verification | Verificación post-scaffolding (estructura, legacy, imports, selectores) | Package Manager, Orquestador |
| anti-loop-protocol | Detección de bucles infinitos | Todos (obligatorio) |
| bootstrap-diagnostics | Diagnóstico de página en blanco con build exitoso (selector duplicado, styleUrls, boot error) | Orquestador, QA Validator |
| bug-investigation | Investigación de bugs (árbol de decisión + formato de reporte) | Orquestador, Explorer |
| contract-verification | Consistencia de nombres entre archivos (métodos, tipos, propiedades) | Verifier |
| design-verification | Verificación de cumplimiento visual (colores neon, fuentes, espaciado) | UI Designer, Verifier |
| e2e-protocol | Validación E2E funcional con Playwright (crear, ejecutar, diagnosticar) | QA Validator |
| game-loop-patterns | Verificación de game loop (deltaTime, coordenadas Y, canvas) | Verifier |
| handoff-protocol | Sistema de delegación entre agentes vía JSON en /tmp/handoff/ | Orquestador, UI Designer, Code Writer, Verifier, QA Validator |
| integration-verification | Verificación de cadena de llamadas servicio-componente | Verifier |
| json-safe-edit | Edición segura de archivos JSON con strings largos escapados | Code Writer |
| mysql | Consultas MySQL del proyecto | Analyst |
| notifications | Formato de notificaciones Slack para el orquestador | Orquestador |
| orchestrator-protocol | Árbol de decisiones para delegar tareas a subagentes | Orquestador |
| partial-edit-protocol | Delegación de modificaciones parciales a code-writer | Orquestador |
| post-implementation | Verificación post-implementación (orquestador delega a verifier) | Orquestador |
| post-write-verification | Checklist post-escritura (imports, variables muertas, coherencia) | Verifier |
| qa-decision-engine | Árbol de decisión para seleccionar tipo de test según cambio | QA Validator |
| qa-protocol | Validación técnica: build, prohibiciones, límites de iteración | QA Validator |
| task-decomposition | Descomposición de tareas en pasos atómicos | Decomposer |
| ui-design-system | Sistema de diseño visual (colores Dark Neon, tipografía, espaciado) | UI Designer, Code Writer |
| unit-testing | Protocolo de tests unitarios (crear, ejecutar, diagnosticar) | QA Validator |
| error-routing | Árbol de decisión para delegar correcciones a code-writer directo vs escalar a build | Verifier, QA Validator |

## Reglas de Interacción

1. Orquestador nunca edita código ni ejecuta bash
2. Subagentes no se auto-invocan (task() prohibido a todos excepto build)
3. UI Designer investiga librerías UI y produce especificaciones JSON; nunca escribe código
4. Researcher investiga APIs REST externas; nunca investiga librerías UI
5. Package Manager solo instala paquetes; nunca investiga ni diseña
6. Code Writer solo escribe código; nunca investiga ni verifica
7. Verifier verifica post-escritura; nunca escribe código ni ejecuta builds
8. QA Validator es el único responsable de build, tests unitarios y tests E2E
9. QA Validator tiene PROHIBICIÓN ABSOLUTA de modificar archivos de implementación (solo *.spec.ts y *.e2e.spec.ts)
10. Detección de bucles: cargar anti-loop-protocol y seguir sus reglas. Si se detecta bucle, reiniciar contexto.
11. Los handoffs los gestiona build. Ningún agente busca ni descubre rutas.
12. Si el usuario da requerimientos de diseño que contradicen ui-design-system, los requerimientos del usuario PREVALECEN.

## Guardrails de Seguridad del Sistema

| # | Guardrail | Agente | Qué protege |
|---|-----------|--------|-------------|
| 1 | SI_NO_HANDOFF_PATH → DETENERSE | Verifier | Evita procesar instrucciones inline y caer en bucle de toolcalls |
| 2 | PRE_FLIGHT_HANDOFF_EXISTS | Build | Evita delegar a verifier sin un handoff JSON válido en disco |
| 3 | TOOLCALL_COUNTER | Todos | Enforcement real del límite de toolcalls (anti-loop-protocol §11) |
| 4 | SKILL_PERMISSION_CHECK | Verifier | Verifica que las skills solicitadas están en su allowlist antes de cargar |
| 5 | GUARDRAIL_ANTI_INLINE | Verifier, QA Validator | Ignora instrucciones inline de build si recibe ruta de handoff |
| 6 | PROMPT_LENGTH_LIMIT | Build | No enviar prompts de >15 líneas a agentes 14B (orchestrator-protocol) |

### Detalle de Guardrails

**GR-1 (SI_NO_HANDOFF_PATH → DETENERSE)**:
- Verifier y QA Validator: al inicio de cada tarea, buscar en el prompt una ruta `/tmp/handoff/.../tareaN.json`.
- Si NO hay ruta → responder `"❌ NO HAY HANDOFF PATH EN PROMPT"` y DETENERSE.
- Si hay ruta pero build también incluyó listas/criterios inline → ignorar el inline, usar solo el handoff JSON.

**GR-2 (PRE_FLIGHT_HANDOFF_EXISTS)**:
- Build: antes de invocar a verifier, verificar que el archivo handoff JSON existe en la ruta.
- Si no existe → no invocar a verifier. Delegar a code-writer para crearlo o crear el handoff manualmente.

**GR-3 (TOOLCALL_COUNTER)**:
- Verifier: max 6 toolcalls. Al llegar al límite, responder `"Verificación parcial por límite de toolcalls"` y DETENERSE.
- No hay excepción por "casi terminar" o "una toolcall más".

**GR-4 (SKILL_PERMISSION_CHECK)**:
- Verifier: revisar su allowlist en opencode-V1.json antes de cargar cualquier skill.
- Si la skill no está en allowlist → NO cargarla. Usar solo las permitidas.

**GR-6 (PROMPT_LENGTH_LIMIT)**:
- Build: cualquier task() a verifier, code-writer, qa-validator, ui-designer o package-manager debe tener MAX 15 líneas.
- Si el plan requiere más → dividir en múltiples task() secuenciales con máximo 5 pasos cada uno.

## Flujo de Trabajo

```
Usuario → Orquestador
            ├→ Decomposer (plan técnico)
            ├→ Package Manager (dependencias, solo si aplica)
            ├→ Explorer (búsquedas, solo si aplica)
            ├→ Researcher (APIs externas, solo si aplica)
            ├→ Analyst (análisis profundo, solo si aplica)
            │
            ├→ UI Designer → produce specs JSON
            │     ↓
            ├→ Code Writer → escribe archivos → handoff a Verifier
            │     ↓
            ├→ Verifier → verifica → handoff a QA Validator
            │     ↓
            └→ QA Validator → build + tests → reporte
                  ↓
            (loop a Code Writer si falla, máx 2 iteraciones)
                  ↓
            Notificación Slack ✅
```

### Secuencia típica de implementación:
1. Orquestador recibe tarea del usuario
2. **Decomposer** planifica (si es tarea compleja, nueva funcionalidad, o requiere varios archivos)
3. **Package Manager** scaffolding del proyecto Angular (primera vez)
4. **UI Designer** produce especificaciones visuales como archivos JSON handoff
5. **Code Writer** implementa según los handoffs (máximo 4 lotes secuenciales si hay muchos archivos)
6. **Verifier** verifica post-escritura: contratos, imports, game loop, estilo
7. **QA Validator** ejecuta build, clasifica cambio con qa-decision-engine, luego tests unitarios y/o E2E según clasificación
8. Si falla: build delega a code-writer para corrección (máx 2 iteraciones)
9. Al completar: notificación Slack (skill notifications)

### Flujo interno de QA Validator:
1. `npm run build`
2. Clasificación del cambio (qa-decision-engine)
3. Si requiere E2E: verificar que `playwright.config.ts` tenga `webServer` configurado. Si falta → delegar a code-writer antes de continuar.
4. Según la clasificación: unit tests, E2E tests, ambos o ninguno
5. Para cada tipo: crea el test si no existe, lo ejecuta si existe, y diagnostica fallos
6. Reporte consolidado

### ⚠️ Regla sobre procesos en background
Los comandos `bash` se ejecutan en shells efímeros: cada toolcall `bash` de OpenCode crea un proceso shell nuevo. Cualquier proceso lanzado con `&` (background) muere al finalizar ese shell. **No usar `&` para procesos persistentes entre toolcalls.** Para servidores de pruebas E2E, Playwright debe gestionar el ciclo de vida vía `webServer` en `playwright.config.ts`.

## Comandos

| Comando | Propósito |
|---|---|---|
| `npm run build` | Build de producción (Angular CLI con Vite) |
| `npm test` | Tests unitarios (Jasmine Karma o Vitest) |
| `npx playwright test` | Tests E2E (Playwright) — requiere `webServer` configurado en `playwright.config.ts` |
| `npx playwright test --headed` | Tests E2E con navegador visible — requiere `webServer` configurado en `playwright.config.ts` |
| `npm start` | Servidor de desarrollo |
| `npm install --save-dev @playwright/test` | Instalar Playwright como dependencia de desarrollo |
| `npx playwright install chromium` | Instalar navegador Chromium para E2E |
| `npx http-server ./dist/dino-runner/browser -p 4200 -c-1` | Servir build estático para E2E (usado internamente por webServer de Playwright) |

## Handoff entre Agentes

El sistema usa handoffs JSON almacenados en `/tmp/handoff/{session_id}/`. Los detalles completos del formato y flujo están en `.opencode/skills/handoff-protocol/SKILL.md`. Puntos clave:

- build genera el session_id y gestiona todas las rutas
- Cada agente escribe en la carpeta del agente destino (no en la propia)
- Formato: `{"tipo": "<spec-ui|plan-logica|verificacion|test>", "origen": "...", "destino": "...", "session_id": "...", "timestamp": "...", "contenido": {...}}`
- Máximo 2 reintentos por agente; si persiste, escalar al usuario

### Formato spec-ui (ui-designer → code-writer)

El campo `contenido` DEBE incluir `componente` (OBLIGATORIO). code-writer deduce las rutas de archivo aplicando la convención de `angular-architecture`:

```json
{
  "tipo": "spec-ui",
  "contenido": {
    "componente": "welcome",
    "template": "Descripción estructural del DOM",
    "styles": "Variables CSS, animaciones, reglas",
    "typescript": "Descripción natural del comportamiento:
      - Eventos que emite (outputs)
      - Servicios que consume (nombres reales)
      - Estado interno (signals/inputs)
      - Event listeners y limpieza
      - Ciclo de vida"
  }
}
```

`componente` es OBLIGATORIO. code-writer resuelve (Angular 21+ sin sufijo `.component`):
- `src/app/[componente]/[componente].ts`
- `src/app/[componente]/[componente].html`
- `src/app/[componente]/[componente].scss`
- `src/app/[componente]/[componente].spec.ts`

## ⚠️ Nota sobre modelos `model-*` en Ollama

Los modelos `model-qa-validator`, `model-verifier` y `model-code-writer` son modelos reales en Ollama (copias locales de `qwen3-coder:30b` con configuraciones específicas de contexto y temperatura). `model-ui-designer` fue reemplazado por `ollama/qwen3:32b` directo. Verificar con `ollama ls` que existen antes de iniciar el flujo.

## ⚠️ Nota sobre tipos de agente en task()

Los tipos de agente personalizados (`code-writer`, `verifier`, `qa-validator`, `ui-designer`, `package-manager`) **pueden no estar disponibles** como valores válidos para `subagent_type` en `task()` en todas las ejecuciones de OpenCode.

**Regla de fallback**: Si `task()` falla con `"Unknown agent type"`, usar `"subagent_type": "general"` con instrucciones muy detalladas que incluyan:
- Carga explícita de skills (`Carga SIEMPRE las skills "handoff-protocol" y "anti-loop-protocol"`)
- Pasos exactos a ejecutar
- Reglas del agente (límites de toolcalls, prohibiciones)
- Formato de handoff de salida si aplica

NUNCA asumas que un tipo de agente personalizado está disponible sin verificarlo primero.
