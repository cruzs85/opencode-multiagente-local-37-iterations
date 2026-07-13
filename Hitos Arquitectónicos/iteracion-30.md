# Hito — Iteración 30

## Resumen

**Configuración:** `configuracion-30(agentes-simplificados-reinicio-29)`  
**Fecha:** Fase 9 — Simplificación con Reinicios  
**Agentes:** 5  
**Skills:** 8  
**Tipo:** Híbrido (Orquestador online + subagentes locales)

---

## Subagentes especializados (con reinicio)

Esta iteración marca el **primer reinicio forzado** del proyecto. La complejidad acumulada en la fase de handoffs (config-19 a config-29) colapsó el sistema.

### Causa del colapso

En config-29 (pico de complejidad):
- 10 agentes
- 29 skills
- Handoff JSON + guardrails de seguridad
- 4 modelos dedicados por rol

**Resultado:** Los agentes locales ignoraban sistemáticamente los handoffs y los guardrails. El contexto saturado hacía que los prompts se perdieran. El orquestador terminaba delegando con `task()` de todas formas, haciendo el sistema handoff inútil.

### Decisión: Reinicio radical

```
10 agentes / 29 skills  ───►  5 agentes / 8 skills
    Handoff JSON       ───►  Abandonado
  4 modelos dedicados  ───►  1 modelo base (model-agent-base)
```

## Nueva arquitectura simplificada

```
Usuario → build (kimi-k2.6 / online)
              │
              ├──► decomposer (model-agent-base) → Investiga + planifica
              ├──► code-writer (model-agent-base) → Escribe y modifica
              ├──► qa-validator (model-agent-base) → Build + tests
              ├──► explorer (model-agent-base) → Búsquedas y diagnóstico
              └──► (Package Manager eliminado, fusionado en code-writer)
```

## Cambios fundamentales

1. **Abandono del handoff:** Toda comunicación vuelve a ser por `task()` directo del orquestador.
2. **Fusión de roles:** `verifier`, `e2e-validator`, `unit-tester` y `package-manager` desaparecen. Sus responsabilidades se absorben por:
   - `code-writer` (instala paquetes, verifica compilación)
   - `qa-validator` (todos los tests)
3. **Modelo único:** Todos los subagentes usan `model-agent-base` (qwen3-coder:30b).
4. **Context7 MCP:** Se añade como experimento para documentación actualizada de Angular 21.
5. **opencode-mem:** Plugin de memoria persistente introducido como experimento.

## Resultados inmediatos

| Métrica | Config-29 (pre-reinicio) | Config-30 (post-reinicio) |
|---------|--------------------------|---------------------------|
| **Agentes** | 10 | 5 |
| **Skills** | 29 | 8 |
| **Variabilidad** | Muy alta | Media |
| **Cumplimiento de prompts** | Bajo (ignoraban handoffs) | Alto |
| **Tiempo de depuración** | Horas | Minutos |
| **VRAM usada** | Saturaba 32 GB | Estable |

## Problemas residuales

- **Context7 no aportó valor** para Angular 21 (documentación desactualizada).
- **8 skills aún eran más de lo necesario.** Algunas eran redundantes (`project-exploration` + `task-decomposition` podían fusionarse).

## Lecciones de esta iteración

1. **Menos es más.** La simplificación radical mejoró la estabilidad más que cualquier optimización previa.
2. **El handoff JSON no justificó su complejidad** sin métricas de tokens que lo respaldaran.
3. **Un modelo base compartido funciona** tan bien como modelos dedicados por rol, con mucho menos overhead.
4. **Reiniciar es válido.** En sistemas multi-agente, la complejidad acumulada es un riesgo real que requiere reseteo periódico.

## Próximo paso

Segundo reinicio (config-32) para reducir de 8 skills a solo 3 esenciales, consolidando el principio de mínima complejidad viable.

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
