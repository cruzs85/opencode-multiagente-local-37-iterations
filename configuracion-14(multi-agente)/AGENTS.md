# Dinosaur Runner — Sistema de Agentes OpenCode

## Arquitectura del Sistema

Este proyecto utiliza un sistema multi-agente orquestado por OpenCode AI. Cada agente tiene un rol especializado y permisos específicos para garantizar un flujo de trabajo seguro, eficiente y libre de bucles infinitos.

[Diagrama de arquitectura]
Orquestador(build) → Decomposer → Code Writer → Verifier → QA Validator → E2E Validator
Además: Explorer, Researcher, Package Manager, Unit Tester

## ⚠️ Entorno de Ejecución — Máquina Local con Escritorio

IMPORTANTE: Este proyecto se ejecuta en una máquina local con monitor, teclado y escritorio gráfico (X11), NO en un servidor headless remoto.

Regla: NO instalar herramientas de visualización remota (VNC, Xvfb). Usar `npx playwright test --headed` directamente.

## Agentes Disponibles

### 1. Orquestador (build) — opencode/big-pickle
Rol: Punto de entrada. Descompone tareas complejas y delega a subagentes.
Regla suprema: No edita código. Delega a code-writer, verifier, decomposer.
Permisos: task.* permitido, edit denegado, bash denegado.

### 2. Decomposer — ollama/qwen3:32b
Rol: Arquitecto técnico. Descompone tareas complejas en pasos atómicos.
Reglas: Prohibido lenguaje ambiguo. Verbos concretos (crear, modificar, añadir).
Permisos: task denegado, edit denegado, bash denegado.

### 3. Explorer — ollama/qwen3-coder:30b
Rol: Analista de codebase en modo solo-lectura. NO verifica código.
Clasificación: TIPO A (ejecución), TIPO B (búsqueda rápida), TIPO C (análisis estructurado).
Permisos: edit denegado, bash permitido solo lectura, webfetch denegado.

### 4. Researcher — ollama/qwen3-coder:30b
Rol: Investiga APIs externas y propone interfaces de servicios Angular.
Permisos: edit denegado, bash denegado, webfetch permitido.

### 5. Code Writer — ollama/qwen3-coder:30b
Rol: Ejecutor de archivos. SOLO escribe. NO verifica nada.
Reglas: cat > para archivos nuevos, edit para cambios parciales.
NO carga skills de verificación. NO analiza código.
Permisos: edit permitido, bash permitido.

### 6. Verifier — ollama/qwen3-coder:30b
Rol: Validador de implementación. Verifica contratos, imports, patrones Angular.
Responsabilidades: contract verification, post-write, angular-architecture, integration.
Permisos: read/glob/grep permitido, edit denegado, bash denegado.

### 7. QA Validator — ollama/qwen3-coder:30b
Rol: Ejecuta build y tests. Máximo 3 iteraciones.
Bash: npm run build*, npm test*, npm run lint* permitidos.

### 8. Package Manager — ollama/qwen3-coder:30b
Rol: Instala paquetes Angular.
Bash: npm install*, npm ci*, npx*, ng* permitidos.

### 9. E2E Validator — ollama/qwen3-coder:30b
Rol: Pruebas funcionales con Playwright. Máximo 2 iteraciones.
Bash: npx playwright test* permitido.

### 10. Unit Tester — ollama/qwen3-coder:30b
Rol: Escribe y ejecuta tests unitarios.
Edit: solo *.spec.ts. Bash: npm test*, npx jest*.

## Skills del Sistema

| Skill | Propósito | Cargada por |
|---|---|---|
| angular-architecture | Patrones Angular | Verifier |
| angular-packages | Dependencias Angular | Package Manager |
| angular-patterns | Sintaxis Angular | Verifier, QA |
| angular-scaffolding | Crear proyecto Angular | Code Writer |
| anti-loop-protocol | Detección de bucles | Todos |
| contract-verification | Consistencia entre archivos | Verifier |
| delegation-protocol | Delegación a code-writer | Orquestador |
| e2e-protocol | Validación E2E | E2E Validator |
| explorer-protocol | Exploración segura | Explorer |
| json-safe-edit | Editar JSON | Code Writer |
| mysql | Consultas MySQL | Explorer |
| notifications | Slack notifications | Orquestador |
| orchestrator-protocol | Leer prompt subagente | Orquestador |
| partial-edit-protocol | Modificaciones parciales | Orquestador |
| post-implementation | Verificación post-implementación | Orquestador |
| post-write-verification | Checklist post-escritura | Verifier |
| qa-protocol | Validación técnica | QA Validator |
| task-decomposition | Descomposición de tareas | Decomposer |

## Reglas de Interacción

1. Orquestador nunca edita código ni ejecuta bash
2. Subagentes no se auto-invocan
3. Cada agente hace una sola cosa
4. Detección de bucles: reiniciar contexto si no ejecuta

## Flujo de Trabajo

Usuario → Orquestador → Decomposer → Code Writer → Verifier → (loop code writer si falla) → QA Validator → (loop code writer si falla) → E2E Validator → (loop code writer si falla) → Notificación Slack ✅

## Comandos

npm run build, npm test, npm run e2e, npm start
