# Hito — Iteración 22

## Resumen

**Configuración:** `configuracion-22(handoff-ui-qwen32)`  
**Fecha:** Fase 8 — Handoff JSON  
**Agentes:** 10  
**Skills:** 29  
**Tipo:** Híbrido (Orquestador online + subagentes locales + Handoff JSON)

---

## QA independiente

Esta iteración representa el **experimento más ambicioso** del proyecto: la introducción del sistema **Handoff JSON** para reemplazar la delegación por `task()` entre subagentes locales.

### ¿Qué es el Handoff?

En lugar de que el orquestador ejecute `task()` para cada paso, los subagentes se comunican mediante archivos JSON en `/tmp/handoff/{session_id}/`:

```json
{
  "tipo": "spec-ui",
  "origen": "ui-designer",
  "destino": "code-writer",
  "contenido": {
    "componente": "welcome",
    "template": "...",
    "styles": "...",
    "typescript": "..."
  }
}
```

### Cadena de handoffs típica

```
UI Designer → spec-ui JSON → Code Writer → verificacion JSON → Verifier → test JSON → QA Validator ✅
```

## Arquitectura en esta iteración

```
Usuario → Orquestador (kimi-k2.6 / online)
              │
              ├──► Decomposer → Plan texto plano
              ├──► UI Designer (qwen3:32b) → Produce spec-ui JSON
              │         ↓ [handoff]
              ├──► Code Writer (model-code-writer) → Lee spec, escribe archivos
              │         ↓ [handoff]
              ├──► Verifier (model-verifier) → Revisa, produce verificacion JSON
              │         ↓ [handoff]
              ├──► QA Validator (model-qa-validator) → Build + tests
              ├──► Analyst (qwen3:32b) → Análisis estructurado
              ├──► Explorer (qwen3-coder:30b) → Búsquedas
              ├──► Researcher (qwen3-coder:30b) → APIs externas
              └──► Package Manager (qwen3-coder:30b) → Dependencias
```

## Modelos dedicados por rol

Por primera vez, se crearon **modelos Ollama personalizados** para roles específicos:

| Modelo Ollama | Base | Contexto | Uso |
|---------------|------|----------|-----|
| `model-code-writer` | qwen3-coder:30b | 32K | Solo escribe código |
| `model-verifier` | qwen3-coder:30b | 32K | Solo verifica post-escritura |
| `model-qa-validator` | qwen3-coder:30b | 32K | Solo build + tests |
| `model-ui-designer` | qwen3:32b | 40K | Diseña UI, produce specs JSON |

## Problemas críticos encontrados

| Problema | Evidencia |
|----------|-----------|
| **Handoffs ignorados** | Los agentes locales omitían sistemáticamente los archivos JSON y seguían usando `task()` directo |
| **Saturación de contexto** | Con 29 skills + handoff-protocol + anti-loop-protocol, el contexto se saturaba y los agentes desobedecían |
| **Complejidad extrema** | 10 agentes, 29 skills, 4 modelos dedicados, handoffs JSON = sistema difícil de depurar |
| **Bucles de VRAM** | Delegación entre qa-validator y code-writer generaba 3-4 iteraciones que agotaban 32 GB de VRAM |
| **Sin métricas de tokens** | No se pudo comprobar si los handoffs realmente reducían el consumo de tokens del orquestador |

## Lecciones de esta iteración

1. **Handoff JSON funcionó tras ajustar prompts**, pero añadió complejidad sin beneficio claro demostrado.
2. **Contexto saturado = agente desobediente.** Con 29 skills, los agentes perdían el hilo de instrucciones.
3. **Delegación entre subagentes es riesgosa.** Solo el orquestador debe delegar; nunca un subagente a otro.
4. **Máximo 2 tareas paralelas** en 32 GB VRAM. Más allá, el sistema se degrada.
5. **Modelos dedicados por rol no mejoraron significativamente** los resultados versus un modelo base compartido.

## Próximo paso

**Reinicio.** La complejidad acumulada obligó a simplificar drásticamente. Config-30 redujo de 10 agentes/29 skills a 5 agentes/8 skills, abandonando el handoff.

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
