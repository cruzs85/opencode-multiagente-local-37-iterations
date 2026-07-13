---
name: error-routing
description: Árbol de decisión para que verifier y qa-validator determinen si delegar una corrección directamente a code-writer (vía handoff) o escalar al orquestador (build). Cárgala cuando encuentres un error, fallo de build o test que requiera corrección.
---

# Skill: error-routing

## Objetivo

Decidir el destino de una corrección según la naturaleza del error, evitando que el orquestador (build) tenga que leer reportes completos para bugs simples, pero escalando cuando se requiere juicio humano o cambio de estrategia.

---

## Árbol de decisión — 4 criterios

Aplica estos criterios EN ORDEN. El primer criterio que coincida determina la acción.

### Criterio 1: Tipo de error

| Error | Destino | Razón |
|---|---|---|
| Import/export incorrecto (ruta, nombre) | **code-writer** | Diagnóstico exacto, cambio mecánico |
| Typos, nombres mal escritos | **code-writer** | Reemplazo directo |
| Propiedad/método faltante (TS error claro) | **code-writer** | Se sabe qué añadir |
| Variable importada pero no usada | **code-writer** | Eliminar línea |
| Selector duplicado | **code-writer** | Renombrar |
| Inconsistencia de firma entre archivos | **code-writer** | Cambio localizado |
| Error de arquitectura (patrón incorrecto, NgModule introducido) | **build** | Requiere decisión de diseño |
| Error con múltiples soluciones posibles | **build** | build elige la mejor estrategia |
| Página en blanco sin error TypeScript | **build** | bootstrap-diagnostics + posible ui-designer |
| Error de dependencias (librería faltante) | **build** | package-manager |
| Mensaje de error ambiguo o contexto insuficiente | **build** | build tiene más contexto |

### Criterio 2: Alcance del cambio

```
¿Afecta 1 solo archivo y el cambio son ≤10 líneas?
  → code-writer

¿Afecta 2+ archivos O requiere +10 líneas de cambio?
  → build
```

### Criterio 3: Claridad del diagnóstico

```
¿El diagnóstico puede expresarse como:
"En [archivo]:[línea] cambiar [A] por [B]"?
  → code-writer

¿Requiere explicar contexto, causa raíz o decisión de diseño?
  → build
```

### Criterio 4: Número de iteraciones

```
¿Es la 1ra vez que se corrige este error?
  → code-writer

¿Ya se intentó corregir 1 vez y el error persiste (mismo error, mismo archivo)?
  → build (rompe posible bucle)
```

---

## Reglas de ejecución

1. Aplica los 4 criterios en orden. El primero que sea determinante gana.
2. Si todos los criterios pasan → `code-writer`.
3. Si algún criterio sugiere `build` → **build**.
4. Al decidir `code-writer`, crea handoff en `/tmp/handoff/{session_id}/code-writer{timestamp}/tareaN.json` con `tipo: "correccion"`.
5. Al decidir `build`, reporta el error completo en tu respuesta (no handoff).

---

## Formato del handoff de corrección (code-writer)

```json
{
  "tipo": "correccion",
  "origen": "verifier | qa-validator",
  "destino": "code-writer",
  "session_id": "[session_id del handoff recibido]",
  "timestamp": "[timestamp actual]",
  "contenido": {
    "error": "mensaje exacto del error",
    "archivo": "ruta/completa/archivo.ts",
    "linea": 42,
    "accion": "cambiar X por Y | añadir Z | eliminar W",
    "diagnostico": "explicación breve de 1 línea"
  }
}
```
