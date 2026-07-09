# Dinosaur Runner — Sistema de Agentes OpenCode

## Arquitectura del Sistema

Este proyecto utiliza un sistema multi-agente orquestado por OpenCode AI. Cada agente tiene un rol especializado y permisos específicos para garantizar un flujo de trabajo seguro, eficiente y libre de bucles infinitos.

```
                     ┌──────────────┐
                     │  Orquestador │  (big-pickle)
                     │   (build)    │
                     └──────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
     ┌────────┴──────┐  ┌──┴────────┐  ┌─┴──────────┐
     │  Decomposer   │  │ Explorer  │  │ Researcher │
     │  (planifica)  │  │ (analiza) │  │ (investiga)│
     └────────┬──────┘  └───────────┘  └────────────┘
              │
     ┌────────┴───────────────────────────────┐
     │           Code Writer                   │
     │  (ejecuta cambios en archivos reales)   │
     └────────┬───────────────────────────────┘
              │
     ┌────────┴────────┐  ┌───────────────┐  ┌──────────────┐
     │  QA Validator   │  │ E2E Validator │  │ Unit Tester  │
     │  (build+test)   │  │ (Playwright)  │  │ (unit tests) │
     └─────────────────┘  └───────────────┘  └──────────────┘
              │
     ┌────────┴────────┐
     │ Package Manager │
     │ (npm/ng tasks)  │
     └─────────────────┘
```

## Agentes Disponibles

### 1. Orquestador (`build`) — `opencode/big-pickle`

**Rol:** Punto de entrada del sistema. Recibe las instrucciones del usuario, descompone tareas complejas y delega a los subagentes correspondientes.

**Regla suprema:** No edita código directamente. Delega toda escritura a `code-writer` y planificación a `decomposer`.

**Regla anti-contradicción:** Antes de dar instrucciones a un subagente, LEE su prompt interno (consultando `opencode.json` o la definición del agente) para conocer sus herramientas y métodos de trabajo preferidos. NO le exijas usar herramientas distintas a las que su prompt le ordena. Por ejemplo, si `code-writer` tiene configurado usar `bash + cat` para archivos completos, no le exijas usar `edit`. Si `qa-validator` tiene restringido el bash a solo ciertos comandos, no le pidas ejecutar otros.

**Permisos:**
- `task.*` → permitido
- `edit` → denegado
- `bash` → denegado

**Modelo:** `opencode/big-pickle`

---

### 2. Decomposer — `ollama/qwen3:32b`

**Rol:** Arquitecto técnico. Descompone tareas complejas en pasos atómicos, secuenciales y verificables. Cada paso debe afectar solo un archivo o responsabilidad clara.

**Reglas:**
- Prohibido usar lenguaje ambiguo ("ajustar", "mejorar", "revisar")
- Usar siempre verbos concretos ("crear", "modificar", "añadir", "reemplazar")
- Incluir criterios de éxito verificables para cada paso
- Clasificar cada tarea según su tipo: `package-installation`, `ui-refactor`, `service-logic`, `api-integration`, `testing`

**Permisos:**
- `task` → denegado
- `edit` → denegado
- `bash` → denegado
- `skill.*` → permitido

**Modelo:** `ollama/qwen3:32b`, temperatura 0.1

---

### 3. Explorer — `ollama/qwen3:8b-q4_K_M`

**Rol:** Analista de codebase en modo solo-lectura. Explora y analiza el código fuente sin modificar nada. Identifica archivos relevantes, entiende flujos de datos y localiza exactamente dónde hacer cambios.

**Protocolo de búsqueda:**
- Si una búsqueda retorna 0 resultados, permite máximo 1 intento adicional con patrón diferente
- Después de 2 intentos sin resultados, reportar: "La característica [X] no existe en el codebase"
- Prohibido repetir la misma búsqueda con variaciones de regex

**Permisos:**
- `edit` → denegado
- `bash` → denegado
- `webfetch` → denegado
- `skill.*` → permitido

**Modelo:** `ollama/qwen3:8b-q4_K_M`, temperatura 0.1
**Fallback:** `ollama/qwen3-coder:30b`

---

### 4. Researcher — `ollama/qwen3:8b-q4_K_M`

**Rol:** Investiga APIs externas y propone interfaces de servicios Angular. Útil para integraciones con APIs externas (OSRM, mapas, etc.).

**Permisos:**
- `edit` → denegado
- `bash` → denegado
- `webfetch` → permitido
- `skill.*` → permitido

**Modelo:** `ollama/qwen3:8b-q4_K_M`, temperatura 0.2
**Fallback:** `ollama/qwen3-coder:30b`

---

### 5. Code Writer — `ollama/qwen3-coder:30b`

**Rol:** Ejecutor de archivos real. Tiene acceso directo al sistema de archivos para crear y modificar código. Es el único agente con capacidad de escritura.

**Reglas:**
- Debe usar herramientas reales (`edit`, `bash`) para alterar el código
- Para SOBREESCRIBIR un archivo completo, usa SIEMPRE `bash` con `cat > ruta << 'EOF'`
- Para cambios parciales en archivos existentes, usa la herramienta `edit`
- No simular ni devolver bloques de texto con formato JSON de herramientas
- Si no ejecuta la herramienta real, rompe el sistema

**Permisos:**
- `edit` → permitido
- `bash` → permitido

**Modelo:** `ollama/qwen3-coder:30b`, temperatura 0
**Fallback:** `ollama/qwen3:32b`

---

### 6. QA Validator — `ollama/qwen3-coder:30b`

**Rol:** Ingeniero de QA. Valida cambios ejecutando build y tests unitarios. Asegura que el proyecto compile y las pruebas pasen antes de dar por completamente un cambio.

**Flujo de validación:**
1. Ejecutar `npm run build` obligatoriamente
2. Si hay errores, clasificarlos (Sintaxis, Arquitectura, Lógica)
3. Delegar corrección a `code-writer` con detalle del error
4. Máximo 3 iteraciones totales
5. Si el error persiste tras la 2ª iteración, escalar a `decomposer` con log completo

**Permisos de bash (restringido):**
- `npm run build*` → permitido
- `npm test*` → permitido
- `npm run lint*` → permitido
- Cualquier otro comando → denegado

**Modelo:** `ollama/qwen3-coder:30b`, temperatura 0.1
**Fallback:** `ollama/qwen3:32b`

---

### 7. Package Manager — `ollama/qwen3-coder:30b`

**Rol:** Instala y configura librerías y paquetes Angular. Gestiona dependencias npm y configuración de Angular CLI.

**Permisos de bash (restringido):**
- `npm install*` → permitido
- `npm ci*` → permitido
- `npx *` → permitido
- `ng *` → permitido

**Modelo:** `ollama/qwen3-coder:30b`, temperatura 0.1
**Fallback:** `ollama/qwen3:32b`

---

### 8. E2E Validator — `ollama/qwen3-coder:30b`

**Rol:** Ingeniero de QA funcional. Valida que la implementación cumple los objetivos funcionales ejecutando pruebas E2E con Playwright.

**Flujo de validación:**
1. Ejecutar `npx playwright test --reporter=list`
2. Si una prueba falla, analizar screenshot en `test-results/` y mensaje de error
3. Clasificar fallo: `[lógica-de-negocio]`, `[ui-renderizado]`, `[datos-incorrectos]`
4. Delegar corrección a `code-writer`
5. Máximo 2 iteraciones

**Permisos de bash (restringido):**
- `npx playwright test*` → permitido

**Modelo:** `ollama/qwen3-coder:30b`, temperatura 0.1
**Fallback:** `ollama/qwen3:32b`

---

### 9. Unit Tester — `ollama/qwen3-coder:30b`

**Rol:** Ingeniero de testing. Escribe y ejecuta pruebas unitarias para el código generado.

**Flujo:**
1. Analizar archivo implementado por `code-writer`
2. Escribir pruebas unitarias cubriendo: caso feliz, casos borde y casos de error
3. Ejecutar `npm test -- --testPathPattern=<archivo>.spec.ts`

**Permisos:**
- `edit` → permitido (solo archivos `*.spec.ts`)
- `bash` → `npm test*`, `npx jest*` permitidos
- `task` → `code-writer` permitido

**Modelo:** `ollama/qwen3-coder:30b`, temperatura 0
**Fallback:** `ollama/qwen3:32b`

## Proveedor de Modelos

Todos los agentes locales utilizan **Ollama** como proveedor, conectado a `http://localhost:11434/v1`.

### Modelos disponibles

| Modelo | Uso principal | Herramientas | Razonamiento | Contexto |
|---|---|---|---|---|
| `qwen3-coder:30b` | Code writer, QA, Package manager, E2E, Unit tester | ✅ | ✅ | 65K |
| `qwen3:8b-q4_K_M` | Explorer, Researcher | ✅ | ✅ | 65K |
| `qwen3:32b` | Fallback de todos los agentes | ✅ | ✅ | 65K |
| `big-pickle` | Orquestador, Decomposer | ✅ | ✅ | — |

## Skills del Sistema

El directorio `.opencode/skills/` contiene habilidades especializadas que los agentes deben cargar según la tarea:

| Skill | Propósito |
|---|---|
| `angular-architecture` | Patrones de diseño Angular, standalone components, signals, inyección de dependencias |
| `angular-packages` | Instalación y configuración de dependencias Angular |
| `angular-patterns` | Reglas estrictas de sintaxis Angular |
| `anti-loop-protocol` | Protocolo general de detección de bucles infinitos |
| `e2e-protocol` | Protocolo anti-loop para validación E2E con Playwright |
| `explorer-protocol` | Protocolo de exploración segura y anti-loop |
| `orchestrator-protocol` | Protocolo para que el orquestador lea el prompt del subagente antes de dar instrucciones, evitando órdenes contradictorias |
| `qa-protocol` | Protocolo de validación técnica y anti-loop |
| `task-decomposition` | Conversión de tareas complejas en pasos concretos |

## Reglas de Interacción

1. **El orquestador nunca edita código directamente** — siempre delega a `code-writer`
2. **El orquestador nunca ejecuta bash directamente** — siempre delega al agente apropiado
3. **Los subagentes no se auto-invocan** — solo el orquestador puede invocar subagentes
4. **Detección de bucles:** Cada skill incluye un protocolo anti-loop. Si un subagente no ejecuta la acción requerida, se reinicia su contexto y se vuelve a invocar exigiendo el uso de herramientas reales
5. **Planificación antes de ejecución:** El `decomposer` debe descomponer tareas complejas antes de que `code-writer` las ejecute
6. **No contradicción de prompts:** El orquestador debe leer el prompt del subagente destino antes de enviarle instrucciones, y alinear sus órdenes con las herramientas y métodos que el subagente tiene configurados

## Flujo de Trabajo Típico

```
Usuario → Orquestador
  → Decomposer (planificar pasos)
    → Code Writer (implementar)
      → Package Manager (instalar dependencias si aplica)
      → QA Validator (build + unit tests)
        → [Si falla] → Code Writer (corregir) → QA Validator (re-validar)
        → [Si pasa] → E2E Validator (Playwright)
          → [Si falla] → Code Writer (corregir) → E2E Validator (re-validar)
          → [Si pasa] → Tarea completada ✅
```

## Comandos de Validación

```bash
npm run build       # Compilar el proyecto Angular
npm test            # Ejecutar pruebas unitarias (Vitest)
npm run e2e         # Ejecutar pruebas E2E (Playwright)
npm start           # Servidor de desarrollo en localhost:4200
```
