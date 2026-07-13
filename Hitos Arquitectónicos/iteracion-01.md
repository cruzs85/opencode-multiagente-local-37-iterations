# Hito — Iteración 01

## Resumen

**Configuración:** `configuracion-1(route-tracker-v1)`  
**Fecha:** Fase 1 — Agentes Online  
**Agentes:** 8  
**Skills:** 7  
**Tipo:** 100% Cloud (OpenRouter, GitHub Copilot, Z.AI)

---

## Estado inicial

Esta fue la primera configuración del experimento. El objetivo era validar si un prompt coloquial podía generar un proyecto Angular 21 funcional usando únicamente agentes en la nube.

- **Prompt:** Lenguaje coloquial intencionado (mismo prompt en las 37 iteraciones).
- **Stack:** Angular 21, Vitest, zoneless, standalone components.
- **Proveedores:** 3 proveedores cloud simultáneos (OpenRouter, GitHub Copilot, Z.AI).
- **Modelos:** DeepSeek V3.2, GLM-4.7 y otros modelos online.

## Primer diseño

La arquitectura inicial consistía en:

- Un orquestador `build` (online) como punto de entrada.
- Agentes genéricos sin especialización profunda.
- RouteTracker v1 para gestión de rutas.
- Conexión directa a APIs cloud con keys expuestas.

```
Usuario → OpenCode → Orquestador (online)
                              │
                              ├──► Agente Genérico A
                              ├──► Agente Genérico B
                              └──► Agente Genérico C
```

## Problemas encontrados

| Problema | Impacto | Severidad |
|----------|---------|-----------|
| **API keys expuestas** | Riesgo de seguridad y costos impredecibles | Alta |
| **Costos elevados** | Cada iteración consumía tokens de múltiples proveedores | Alta |
| **Latencia de red** | Tiempo de respuesta inconsistente entre agentes | Media |
| **Modelos qwen descartados** | Algunos modelos de la familia qwen en OpenRouter no soportaban Tools | Media |
| **Variabilidad alta** | Resultados inconsistentes entre ejecuciones con el mismo prompt | Media |
| **Dependencia total de cloud** | Sin conexión a internet, el sistema no funciona | Alta |

## Lecciones de esta iteración

1. Los proveedores cloud funcionan, pero son costosos y lentos para iteración rápida.
2. La falta de especialización de agentes genera resultados inconsistentes.
3. Es necesario un control más granular de permisos por agente.
4. La latencia de red introduce fricción innecesaria en el flujo de trabajo.

## Próximo paso

Migrar a modelos locales con Ollama para reducir costos y latencia, manteniendo el orquestador en la nube como punto de entrada.

---

[← Volver a Hitos Arquitectónicos](../README.md#hitos-arquitectónicos)
