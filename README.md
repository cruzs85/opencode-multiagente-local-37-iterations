# Configuración OpenCode — 37 iteraciones exploratorias

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Ollama%20%2B%20OpenCode-blue)](https://opencode.ai)
[![Iteraciones](https://img.shields.io/badge/Iteraciones-37-orange)](.)
[![Estado](https://img.shields.io/badge/Estado-Exploratorio-lightgrey)](.)

Bitácora exploratoria que documenta la evolución de un sistema multi-agente local (Ollama) con OpenCode y para desarrollar un proyecto *Dinosaur Runner* en Angular 21. 37 configuraciones, 2 reinicios por saturación de complejidad, 10 conclusiones empíricas.

> **Público objetivo:** Developer Workflow Engineers, AI Automation Engineers, Agent Engineering practitioners.
>
> **Documentos relacionados:** [Narrativa detallada →](NARRATIVA.md) · [Conclusiones →](CONCLUSIONES.md)

---

## Hardware

| Componente | Especificación |
|------------|---------------|
| GPU | Radeon AI PRO R9700 Creator (32 GB VRAM) |
| CPU | AMD Ryzen 9 7900X |
| RAM | 64 GB DDR5 |
| SO | POP_OS |
| Stack | Ollama + OpenCode |

## El prompt de control (Lenguaje Coloquial Intencionado)

> *Quiero hacer un juego de dinosaurio para el navegador... Que funcione, que compile y que tenga pruebas automáticas e2e de al menos 15...*

Mismo prompt en las 37 iteraciones. [Ver completo](NARRATIVA.md#el-prompt).

## Metodología

1. Ejecutar prompt con lenguaje altamente coloquial con la configuración actual.
2. Si el proyecto **no funcionaba**: analizar causa, corregir prompt o skills.
3. Si **funcionaba**: revisar outputs, identificar dificultades, ajustar.
4. Periódicamente: cambiar modelo del build agent (online ↔ local).
5. Configuración óptima encontrada: **híbrida** (build online kimi-k2.6 + subagentes locales Ollama).

---

## Las 37 iteraciones en una tabla

| # | Agentes | Skills | Tipo | Hito |
|---|---------|--------|------|------|
| 1 | 8 | 7 | Online | RouteTracker v1, 3 proveedores cloud |
| 2 | 8 | 7 | Online | Refinamiento de prompts |
| 3 | 8 | 9 | Online | Especialización de agentes online |
| 4 | 8 | 12 | Local | Primer intento 100% Ollama |
| 5 | 8 | 9 | Híbrido | OpenRouter + Ollama |
| 6 | 8 | 9 | Local | Devstral-small-2 como principal |
| 7 | 8 | 10 | Local | Mejora sistemática de prompts |
| 8 | 8 | 10 | Local | Migración a qwen3-coder:30b |
| 9 | 8 | 12 | Local | Skills anti-contradicción |
| 10 | 8 | 12 | Local | Solo dos modelos (qwen3-coder + deepseek-r1) |
| 11 | 8 | 17 | Local | Verificación post-implementación |
| 12 | 8 | 17 | Local | Orquestador local consolidado |
| 13 | 9 | 22 | Local | MySQL + Slack |
| 14 | **10** | **24** | Local | **Pico de agentes.** Roles independientes |
| 15 | 10 | 24 | Local | Prompts optimizados |
| 16 | 10 | 26 | Local | Agentes ui-designer + analyst |
| 17 | 10 | 26 | Híbrido | Orquestador kimi-k2.6 |
| 18 | 10 | 26 | Híbrido | Prompts reforzados |
| 19 | 10 | 28 | Híbrido | Handoff JSON |
| 20 | 10 | 28 | Híbrido | Límites de handoff |
| 21 | 10 | **29** | Híbrido | Modelos dedicados por rol |
| 22 | 10 | 29 | Híbrido | UI designer con qwen3:32b |
| 23 | 10 | 29 | Híbrido | Renombrado de agentes |
| 24 | 10 | 29 | Híbrido | Handoff + Angular |
| 25 | 10 | 29 | Híbrido | Handoff Angular v2 |
| 26 | 10 | 29 | Híbrido | Handoff Angular v3 |
| 27 | 10 | 29 | Híbrido | Handoff Angular v4 |
| 28 | 10 | 29 | Híbrido | Diagnóstico canvas + JIT |
| 29 | 10 | **29** | Híbrido | Guardrails seguridad ⚠️ **PICO COMPLEJIDAD** |
| **30** 🔄 | **5** | **8** | Híbrido | **REINICIO.** Handoff abandonado |
| 31 | 5 | 8 | Híbrido | Puntos de control build |
| **32** 🔄 | **5** | **3** | Híbrido | **REINICIO.** Solo 3 skills esenciales |
| 33 | 6 | 4 | Híbrido | Agente debugging dedicado |
| 34 | 6 | 4 | Híbrido | Memoria persistente (opencode-mem) |
| 35 | 6 | 4 | Híbrido | Permisos QA ampliados |
| 36 | 6 | 5 | Híbrido | Slack orquestación |
| 37 ✅ | **6** | **5** | Híbrido | **Configuración final** |

**Leyenda:** 🔄 Reinicio · ✅ Final · ⚠️ Pico de complejidad

---

## Los 2 reinicios

| # | De | A | Causa |
|---|----|---|-------|
| config-30 | 10 agentes / 29 skills | 5 agentes / 8 skills | Handoff JSON ignorado por saturación de contexto |
| config-32 | 5 agentes / 8 skills | 5 agentes / 3 skills | Skills redundantes, Context7 sin impacto |

[Detalles de cada reinicio →](NARRATIVA.md#fase-9--simplificacion-con-reinicios-config-30-a-config-37)

## Las 10 conclusiones principales

[Ver completo →](CONCLUSIONES.md)

1. Es mejor añadir una skill a un agente existente antes que crear uno nuevo para desempeñar una nueva tarea.
2. Agentes locales requieren prompts más detallados que los online.
3. Contexto saturado → agente desobedece.
4. Prompt saturado incluyendo skills → dividir responsabilidades en dos agentes.
5. Más agentes → más variabilidad de resultados.
6. Limitar iteraciones en el prompt > skill antiloop.
7. Delegación entre subagentes locales → loops y saturación de VRAM.
8. Máximo 2 tareas paralelas para agentes locales en 32 GB VRAM.
9. Handoff JSON: tras ajustar los prompts logró funcionar, pero no se comprobó que redujera significativamente los tokens de build. Queda como pregunta abierta.
10. Context7 no aportó valor para Angular 21.

---

## Configuración final (config-37)

| Agente | Modelo | Rol |
|--------|--------|-----|
| build | opencode-go/kimi-k2.6 | Orquestador |
| decomposer | model-agent-base | Planificador |
| code-writer | model-agent-base | Escritura de código |
| qa-validator | model-agent-base | Build + tests |
| explorer | model-agent-base | Búsquedas y diagnóstico |
| debugging | model-debugging | Análisis de bugs complejos |

[Modelfiles →](NARRATIVA.md#modelfiles) · [AGENTS.md de config-37 →](configuracion-37(configuracion-final)/AGENTS.md)

---

## Estructura del repositorio

```
configuracion-1(route-tracker-v1)/
...
configuracion-30(agentes-simplificados-reinicio-29)/  # 🔄 REINICIO
...
configuracion-32(skills-esenciales-reinicio-31)/      # 🔄 REINICIO
...
configuracion-37(configuracion-final)/
├── opencode.json       # Configuración de OpenCode
├── AGENTS.md           # Documentación del sistema multi-agente
├── modificaciones.txt  # Cambios respecto a la configuración anterior
├── resultado/          # Proyecto Angular generado (sin node_modules)
└── .opencode/
    ├── skills/         # Skills del sistema
    └── models/         # Modelfiles de Ollama
```

Cada carpeta es un snapshot completo y autocontenido.

---

## Licencia

MIT
