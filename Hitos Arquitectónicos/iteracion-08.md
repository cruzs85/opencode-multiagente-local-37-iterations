# Hito — Iteración 08

## Resumen

**Configuración:** `configuracion-8(migracion-qwen3-coder)`  
**Fecha:** Fase 4 — Refinamiento de Prompts  
**Agentes:** 8  
**Skills:** 10  
**Tipo:** 100% Local (Ollama)

---

## Introducción de especialización

Esta iteración marca el punto de inflexión donde el sistema deja de ser un conjunto de agentes genéricos y comienza a definir **roles rígidos y especializados**.

Fue la primera configuración donde:

- Cada agente tiene un **nombre funcional** (`decomposer`, `explorer`, `code-writer`, `qa-validator`, etc.).
- Se establecen **permisos granulares** por agente (qué tools puede usar, qué comandos de bash puede ejecutar).
- Se introducen **protocolos anti-loop** para detectar y prevenir bucles infinitos.
- Se migra el modelo principal de `devstral-small-2` a `qwen3-coder:30b`, con mejoras notables en calidad de código.

## Beneficios observados

| Métrica | Antes (config-4-7) | Después (config-8) |
|---------|--------------------|--------------------|
| **Especialización** | Agentes genéricos sin roles claros | 8 agentes con responsabilidades definidas |
| **Permisos** | Permisos amplios para todos | Permisos restringidos por rol |
| **Anti-loop** | Loops frecuentes | Detección y prevención sistemática |
| **Calidad de código** | Intermitente (devstral alucinaba) | Mejorada con qwen3-coder |
| **Previsibilidad** | Baja | Media-Alta |

## Arquitectura en esta iteración

```
Usuario → Orquestador (big-pickle / online)
              │
              ├──► Decomposer (planifica)
              ├──► Explorer (analiza código)
              ├──► Researcher (investiga APIs)
              ├──► Code Writer (ejecuta cambios)
              ├──► QA Validator (build + tests)
              ├──► E2E Validator (Playwright)
              ├──► Unit Tester (pruebas unitarias)
              └──► Package Manager (npm/ng)
```

## Cambios clave

1. **Migración a qwen3-coder:30b:** Reemplazo de `devstral-small-2` como modelo principal de código. El cambio mejoró notablemente el cumplimiento de reglas Angular, aunque de forma intermitente.
2. **Skills anti-contradicción:** Nuevas skills para evitar que agentes locales se contradigan entre sí.
3. **Reducción a 2 modelos:** Consolidación de `qwen3-coder:30b` y `qwen3:32b` como únicos modelos locales.
4. **Verificación post-implementación:** Introducción de checkpoints obligatorios tras cada fase de escritura.

## Problemas persistentes

- **Intermitencia:** Aunque mejoró, algunas ejecuciones seguían ignorando reglas del prompt o skills.
- **Contexto insuficiente:** `num_ctx` configurado en `opencode.json` no siempre era respetado por Ollama.
- **Comunicación por task():** Toda delegación pasaba por `task()`, generando overhead de contexto en el orquestador.

## Lecciones de esta iteración

1. **Especialización de agentes mejora la calidad**, pero aumenta la complejidad de configuración.
2. **Los modelos locales requieren más instrucciones** que los online (skills explícitas vs. comportamiento implícito).
3. **Los parámetros de contexto deben configurarse en Ollama**, no solo en `opencode.json`.
4. **Menos modelos = menos variabilidad.** Consolidar en 2 modelos redujo el ruido.

## Próximo paso

Consolidar el orquestador híbrido (online + local) y experimentar con sistemas de handoff para reducir el overhead de `task()`.

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
