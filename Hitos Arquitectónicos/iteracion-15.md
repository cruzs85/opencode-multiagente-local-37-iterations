# Hito — Iteración 15

## Resumen

**Configuración:** `configuracion-15(prompts-optimizados)`  
**Fecha:** Fase 6 — Optimización  
**Agentes:** 10  
**Skills:** 26  
**Tipo:** Híbrido (Orquestador online + subagentes locales)

---

## Separación de investigación

Esta iteración consolidó la **especialización funcional** introducida en la config-8 y la llevó al siguiente nivel. Fue el pico de complejidad en número de agentes y skills antes de los reinicios.

Logros principales:

- **Prompts optimizados:** Cada agente recibió prompts reforzados con reglas rígidas y ejemplos concretos.
- **Nuevos agentes especializados:** Se añadieron `ui-designer` y `analyst` como roles independientes.
- **Orquestador kimi-k2.6:** El orquestador `build` migra de `big-pickle` a `opencode-go/kimi-k2.6`, mejorando la calidad de planificación.
- **Separación total de responsabilidades:** Cada agente hace exactamente UNA cosa.

## Mejora de calidad

| Aspecto | Evolución |
|---------|-----------|
| **Planificación** | `decomposer` con `qwen3:32b` y prompts anti-ambigüedad |
| **Exploración** | `explorer` en modo solo-lectura con clasificación TIPO A/B/C |
| **Escritura** | `code-writer` con prohibición absoluta de verificar o investigar |
| **Verificación** | `verifier` como agente independiente de revisión post-escritura |
| **Testing** | `qa-validator`, `e2e-validator` y `unit-tester` como 3 agentes separados |
| **Diseño UI** | `ui-designer` investiga librerías y produce especificaciones JSON |

## Arquitectura en esta iteración

```
Usuario → Orquestador (kimi-k2.6 / online)
              │
              ├──► Decomposer (qwen3:32b) → Plan técnico
              ├──► Explorer (qwen3-coder:30b) → Búsqueda rápida
              ├──► Researcher (qwen3-coder:30b) → APIs externas
              ├──► Analyst (qwen3:32b) → Análisis estructurado
              ├──► UI Designer (qwen3:32b) → Specs visuales JSON
              │         ↓
              ├──► Code Writer (qwen3-coder:30b) → Implementa
              │         ↓
              ├──► Verifier (qwen3-coder:30b) → Revisa contratos
              │         ↓
              ├──► QA Validator (qwen3-coder:30b) → Build + tests
              ├──► E2E Validator (qwen3-coder:30b) → Playwright
              ├──► Unit Tester (qwen3-coder:30b) → Tests unitarios
              └──► Package Manager (qwen3-coder:30b) → Dependencias
```

## Skills del sistema (26 skills)

| Skill | Propósito |
|-------|-----------|
| `angular-architecture` | Patrones Angular |
| `angular-patterns` | Sintaxis estricta |
| `anti-loop-protocol` | Detección de bucles |
| `contract-verification` | Consistencia entre archivos |
| `e2e-protocol` | Validación E2E |
| `explorer-protocol` | Exploración segura |
| `qa-protocol` | Validación técnica |
| `task-decomposition` | Descomposición atómica |
| `orchestrator-protocol` | Árbol de decisiones del orquestador |
| `ui-design-system` | Sistema Dark Neon |

*(Y 16 skills adicionales para casos específicos.)*

## Problemas observados

- **Complejidad administrativa:** 26 skills eran difíciles de mantener y depurar.
- **Fragilidad:** Si una skill fallaba al cargarse, el agente perdía comportamiento crítico.
- **Variabilidad creciente:** A mayor número de agentes, mayor dispersión en resultados.
- **Handoffs aún no probados:** La delegación seguía siendo 100% por `task()`.

## Lecciones de esta iteración

1. **Prompts reforzados mejoran el cumplimiento**, pero no eliminan la variabilidad.
2. **10 agentes especializados producen calidad técnica**, pero el sistema se vuelve frágil.
3. **La especialización tiene un límite:** Más allá de cierto punto, añadir agentes nuevos reduce la estabilidad general.
4. **El orquestador online (kimi-k2.6) demostró ser superior** a modelos locales para planificación de alto nivel.

## Próximo paso

Experimentar con handoff JSON para reducir el overhead de `task()` y probar si la complejidad puede compensarse con mejor comunicación entre agentes.

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
