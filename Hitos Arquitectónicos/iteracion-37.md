# Hito — Iteración 37

## Resumen

**Configuración:** `configuracion-37(configuracion-final)`  
**Fecha:** Fase 9 — Configuración Final y Refinada  
**Agentes:** 6  
**Skills:** 5  
**Tipo:** Híbrido (Orquestador online + subagentes locales)

---

## Arquitectura actual

Esta es la configuración final y más refinada del proyecto. Representa el **equilibrio óptimo** entre especialización y simplicidad, fruto de 37 iteraciones, 2 reinicios y 10 conclusiones empíricas.

### Filosofía

> *"Es mejor añadir una skill a un agente existente antes que crear uno nuevo para desempeñar una nueva tarea."* — Conclusión #1

### Agentes (6)

| Agente | Modelo | Rol | Especialización |
|--------|--------|-----|-----------------|
| **build** | `opencode-go/kimi-k2.6` | Orquestador | Planificación, delegación, memoria persistente, notificaciones Slack |
| **decomposer** | `ollama/model-agent-base` | Planificador | Investiga estructura real del disco y desglosa objetivos en tareas secuenciales |
| **code-writer** | `ollama/model-agent-base` | Escritura de código | Escribe/modifica archivos. Verifica compilación. **NO crea tests.** |
| **qa-validator** | `ollama/model-agent-base` | QA + Testing | Build, tests unitarios, tests E2E. Crea/corrige `*.spec.ts`. |
| **explorer** | `ollama/model-agent-base` | Diagnóstico rápido | Búsquedas, localización de archivos, verificación de existencia. **Solo lectura, sin razonamiento.** |
| **debugging** | `ollama/model-debugging` | Análisis profundo | Causa raíz de bugs complejos. **Solo lectura + razonamiento.** NO edita. |

### Skills (5)

| Skill | Propósito | Cargada por |
|-------|-----------|-------------|
| `angular-patterns` | Reglas Angular 21 (signals, mocks, @if/@for, inject(), tests Vitest) | code-writer (obligatorio #1), qa-validator, decomposer, debugging |
| `node-setup` | Patrón nvm/source para comandos npm/npx en shell separado | code-writer, qa-validator, decomposer |
| `ui-design-system` | Sistema de diseño Dark Neon (colores, tipografía, efectos) | code-writer (al crear UI) |

### Flujo de trabajo (3 fases)

```
Usuario → build (kimi-k2.6 / online)
  │
  FASE 1 ──► task(code-writer, scaffolding Angular 21)
  │            → npm run build → ng test
  │          task(explorer, verificación rápida: ¿existe src/app/?)
  │
  FASE 2 ──► task(decomposer, investiga + planifica)
  │            → Build confía en el plan. No lo verifica.
  │
  FASE 3 ──► task(code-writer, paso 1) → code-writer verifica build
  │          [BUILD: qa-validator verifica]
  │          task(code-writer, paso 2)
  │          [BUILD: qa-validator verifica]
  │          ...
  │          task(qa-validator, tests finales + suite E2E)
  │
  DIAGNÓSTICO (si falla):
    Error simple  → task(explorer) → build ajusta
    Error complejo → task(debugging) → build recibe diagnóstico → code-writer corrige
```

### Modelos Ollama

```ollama
# model-agent-base (subagentes de código y diagnóstico rápido)
FROM qwen3-coder:30b
PARAMETER num_ctx 65536
PARAMETER temperature 0
PARAMETER top_k 20
PARAMETER top_p 0.8
PARAMETER repeat_penalty 1.05

# model-debugging (razonamiento profundo)
FROM qwen3:32b
PARAMETER num_ctx 32768
PARAMETER temperature 0
PARAMETER top_k 20
PARAMETER top_p 0.8
```

### Memoria persistente

- **Plugin:** `opencode-mem` con captura automática de contexto (`qwen3:8b`)
- **Tool nativa:** `memory({ mode: "search", query: "..." })` para recuperar contexto histórico
- **Inyección automática:** `chatMessage` inserta hasta 3 memorias relevantes al inicio de cada sesión
- **Web UI:** `http://127.0.0.1:4747` para explorar y gestionar memorias

### Notificaciones Slack

El orquestador envía notificaciones automáticas en 3 momentos:
1. 📨 Al recibir prompt del usuario
2. ⚠️ Antes de acciones que requieren permiso
3. ✅ Al completar todas las fases con resumen de resultados

### Límites y guardrails

| Límite | Valor | Propósito |
|--------|-------|-----------|
| Toolcalls code-writer | Máx 8 por tarea | Prevenir loops de escritura |
| Archivos por task | Máx 3 | Evitar cambios atómicos masivos |
| Tareas paralelas | Máx 2 | Respetar los 32 GB de VRAM |
| Reescrituras del mismo archivo | Máx 2 seguidas | Evitar hot loops |
| Iteraciones qa-validator | 3 build + 2 por tipo de test | Prevenir bucles de corrección |

## ¿Por qué funciona?

1. **6 agentes es el número correcto** para este stack hardware: suficiente para especialización, no tanto como para variabilidad extrema.
2. **5 skills es el mínimo viable:** cubren todo el flujo (Angular, Node, UI) sin redundancia.
3. **Orquestador online + subagentes locales:** el orquestador hace lo que mejor sabe (planificación, decisión) y los locales hacen lo que mejor saben (código, tests, diagnóstico) sin costos de API.
4. **Memoria persistente:** elimina la pérdida de contexto entre sesiones, un problema crítico en iteraciones anteriores.
5. **Diagnóstico separado en 2 niveles:** `explorer` para errores simples (rápido, barato) y `debugging` para errores complejos (profundo, pero solo cuando se necesita).

## Resultado final

- **Proyecto generado:** Dinosaur Runner en Angular 21
- **Stack:** Vitest, zoneless, standalone components, signals, Playwright E2E
- **Tests:** 15+ tests E2E funcionales + tests unitarios
- **Build:** Compila sin errores
- **Costo de subagentes:** $0 (100% local)

## Lecciones finales

1. **La arquitectura final es 5x más simple que el pico de complejidad (config-29), y produce mejores resultados.**
2. **El contexto es el recurso más escaso en sistemas multi-agente locales. Protegerlo es más importante que añadir features.**
3. **Un prompt coloquial bien ejecutado por una arquitectura refinada supera cualquier prompt ingenieril ejecutado por una arquitectura caótica.**

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
