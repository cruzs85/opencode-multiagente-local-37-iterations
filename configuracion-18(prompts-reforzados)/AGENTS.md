# Dinosaur Runner — Sistema de Agentes OpenCode

## Arquitectura del Sistema

Este proyecto utiliza un sistema multi-agente orquestado por OpenCode AI. Cada agente tiene un rol especializado y permisos específicos para garantizar un flujo de trabajo seguro, eficiente y libre de bucles infinitos.

[Diagrama de arquitectura]
Orquestador(build) → ui-designer → Code Writer → Verifier → QA Validator ✅
Además: Decomposer, Explorer, Analyst, Researcher, Package Manager

## ⚠️ Entorno de Ejecución — Máquina Local con Escritorio

IMPORTANTE: Este proyecto se ejecuta en una máquina local con monitor, teclado y escritorio gráfico (X11), NO en un servidor headless remoto.

Regla: NO instalar herramientas de visualización remota (VNC, Xvfb). Usar `npx playwright test --headed` directamente.

## Agentes Disponibles

### 1. Orquestador (build) — opencode/Kimi-K2.6
Rol: Punto de entrada. Descompone tareas complejas y delega a subagentes.
Regla suprema: No edita código. Delega a ui-designer, code-writer, verifier, qa-validator, decomposer, analyst, package-manager.
Permisos: task.* permitido, edit denegado, bash denegado.

### 2. Decomposer — ollama/qwen3:32b
Rol: Arquitecto técnico. Descompone tareas complejas en pasos atómicos.
Reglas: Prohibido lenguaje ambiguo. Verbos concretos (crear, modificar, añadir).
Permisos: task denegado, edit denegado, bash denegado.

### 3. Explorer — ollama/qwen3-coder:30b
Rol: Localizador técnico. Encuentra archivos, funciones, rutas, tablas. Ejecuta comandos.
Clasificación: TIPO A (ejecución), TIPO B (búsqueda rápida).
Permisos: edit denegado, bash permitido (node, head, wc, cat, ls, echo), webfetch denegado.
NO carga skills. NO hace análisis profundo.

### 4. Researcher — ollama/qwen3-coder:30b
Rol: Investiga APIs REST externas y propone interfaces de servicios Angular.
Permisos: edit denegado, bash denegado, webfetch permitido, websearch permitido.
Límite: No investiga librerías de UI (PrimeNG, Angular Material). Eso lo hace @ui-designer.

### 5. Analyst — ollama/qwen3-coder:30b
Rol: Analista de codebase. Analiza flujos, arquitectura, dependencias y estructura multi-archivo.
Responsabilidades: análisis estructurado TIPO C, generar informes con fingerprint, trazar relaciones entre componentes.
Carga SIEMPRE: 'analyst-protocol' y 'anti-loop-protocol'.
Permisos: edit denegado, bash permitido solo lectura, webfetch permitido.

### 6. UI Designer — ollama/qwen3-coder:30b
Rol: Diseña pantallas y componentes visuales. Investiga librerías UI (PrimeNG, Angular Material) y produce especificaciones completas para code-writer.
Flujo:
  1. Carga 'ui-design-system', 'angular-architecture', 'angular-patterns', 'anti-loop-protocol'
  2. Investiga con webfetch la documentación oficial del componente
  3. Si la librería no está instalada, DELEGA a @package-manager
  4. Produce especificación (template, TS, SCSS) y DELEGA a @code-writer
  5. Si code-writer falla por spec incompleta: refinar y re-delegar (máx 1 iteración)
Permisos: edit denegado, bash denegado, webfetch permitido, websearch permitido, task a code-writer/package-manager/decomposer permitido.

### 7. Code Writer — ollama/qwen3-coder:30b
Rol: Ejecutor de archivos. SOLO escribe. NO verifica nada.
Reglas: cat > para archivos nuevos, edit para cambios parciales.
NO carga skills de verificación. NO analiza código.
Permisos: edit permitido, bash permitido.

### 8. Verifier — ollama/qwen3-coder:30b
Rol: Validador de implementación. Verifica contratos, imports, patrones Angular.
Responsabilidades: contract verification, post-write, angular-architecture, integration.
Permisos: read/glob/grep permitido, edit denegado, bash denegado.

### 9. QA Validator — ollama/qwen3-coder:30b
Rol: Valida cambios ejecutando build + tests unitarios + tests E2E. Decide autónomamente qué pruebas ejecutar según el cambio (usa qa-decision-engine).
Capacidades:
- Build (npm run build)
- Tests unitarios (npm test) — crea, ejecuta o modifica *.spec.ts según sea necesario
- Tests E2E (npx playwright test) — crea, ejecuta o modifica *.e2e.spec.ts según sea necesario
Edit: solo *.spec.ts y *.e2e.spec.ts (crear o corregir tests).
Skills: qa-protocol, qa-decision-engine, unit-testing, e2e-protocol, angular-architecture.
Límites: 3 iteraciones build + 2 iteraciones por tipo de test.

### 10. Package Manager — ollama/qwen3-coder:30b
Rol: Instala paquetes Angular. Recibe instrucciones del orquestador o de @ui-designer.
Bash: npm install*, npm ci*, npx*, ng* permitidos.
Límite: No investiga qué instalar, solo ejecuta la instalación.

## Skills del Sistema

| Skill | Propósito | Cargada por |
|---|---|---|
| agent-scope-limits | Límites de alcance para correcciones (mínimo cambio, sin refactors no solicitados) | QA Validator, Code Writer |
| analyst-protocol | Análisis estructurado multi-archivo | Analyst |
| angular-architecture | Patrones Angular | Verifier |
| angular-packages | Dependencias Angular | Package Manager |
| angular-patterns | Sintaxis Angular | Verifier, QA Validator, UI Designer |
| angular-scaffolding | Crear proyecto Angular | Code Writer |
| anti-loop-protocol | Detección de bucles | Todos |
| bug-investigation | Investigación de bugs (árbol de decisión + formato de reporte) | Orquestador, Explorer |
| contract-verification | Consistencia entre archivos | Verifier |
| delegation-protocol | Delegación a code-writer | Orquestador |
| e2e-protocol | Validación E2E (crear, ejecutar, diagnosticar) | QA Validator |
| game-loop-patterns | Verificación de game loop (deltaTime, coordenadas Y, cancelAnimationFrame) | Verifier |
| integration-verification | Verificación de cadena de llamadas servicio-componente | Verifier |
| json-safe-edit | Editar JSON | Code Writer |
| mysql | Consultas MySQL | Analyst |
| notifications | Slack notifications | Orquestador |
| orchestrator-protocol | Leer prompt subagente | Orquestador |
| partial-edit-protocol | Modificaciones parciales | Orquestador |
| post-implementation | Verificación post-implementación | Orquestador |
| post-write-verification | Checklist post-escritura | Verifier |
| qa-decision-engine | Árbol de decisión de tests según cambio | QA Validator |
| qa-protocol | Validación técnica y flujo unificado | QA Validator |
| task-decomposition | Descomposición de tareas | Decomposer |
| ui-design-system | Sistema de diseño visual (colores, tipografía, espaciado, librería activa) | UI Designer, Code Writer |
| unit-testing | Protocolo de tests unitarios (crear, ejecutar, diagnosticar) | QA Validator |

## Reglas de Interacción

1. Orquestador nunca edita código ni ejecuta bash
2. Subagentes no se auto-invocan
3. UI Designer investiga librerías UI y produce especificaciones; nunca escribe código
4. Researcher investiga APIs REST externas; nunca investiga librerías UI
5. Package Manager solo instala paquetes; nunca investiga ni diseña
6. Code Writer solo escribe código; nunca investiga ni verifica
7. Verifier verifica post-escritura; nunca escribe código ni ejecuta builds
8. QA Validator es el único responsable de build, tests unitarios y tests E2E
9. Detección de bucles: reiniciar contexto si no ejecuta

## Flujo de Trabajo

Usuario → Orquestador → ui-designer → Code Writer → Verifier → (loop code writer si falla) → QA Validator → (loop code writer si falla) → Notificación Slack ✅

El QA Validator ejecuta internamente:
1. Build (npm run build)
2. Clasificación del cambio (qa-decision-engine)
3. Según la clasificación: unit tests, E2E tests, ambos o ninguno
4. Para cada tipo: crea el test si no existe, lo ejecuta si existe, y diagnostica fallos
5. Reporte consolidado

## Comandos

npm run build, npm test, npm run e2e, npm start