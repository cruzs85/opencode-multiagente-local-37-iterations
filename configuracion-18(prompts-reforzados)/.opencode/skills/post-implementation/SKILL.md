---
name: post-implementation
description: Protocolo de verificación post-implementación para el orquestador. Define los pasos a seguir después de que code-writer complete un lote de cambios y antes de pasar a QA. El orquestador debe delegar la verificación al agente @verifier, no al explorer.
---

# Post-Implementation Protocol

## Objetivo
Verificar que los cambios implementados por code-writer son correctos ANTES de pasar a la fase de QA. Esta verificación la realiza el agente @verifier, que carga las skills adecuadas según el tipo de archivo.

## Cuándo usarla
Después de que code-writer complete un lote de escritura de archivos, y ANTES de delegar a qa-validator.

---

## Flujo de verificación

### Paso 1: Delegar a @verifier (OBLIGATORIO — NO SALTAR)
⚠️ Este paso es ABSOLUTAMENTE OBLIGATORIO. El orquestador NO PUEDE saltarlo bajo ninguna circunstancia.

Pide a @verifier que verifique los archivos modificados. Además, el orquestador DEBE leer el archivo destino con `read` para confirmar que el contenido es el esperado y no confiar en "✅" del code-writer sin verificación.

El verifier carga automáticamente:

- `contract-verification` → para verificar que nombres de métodos, propiedades e interfaces coinciden entre archivos
- `post-write-verification` → para verificar imports, variables muertas, métodos públicos sin callsite, coherencia aritmética
- `angular-architecture` → para verificar boilerplate Angular (standalone, styleUrl, afterNextRender, inject)
- `game-loop-patterns` → para verificar el game loop (deltaTime, coordenadas Y, cancelAnimationFrame)
- `integration-verification` → para verificar la cadena de llamadas servicio-componente

### Paso 2: Recibir y clasificar el reporte
Cuando @verifier responda, clasifica cada hallazgo:

| Clasificación | Significado | Acción |
|---|---|---|
| **Falso positivo** | El hallazgo no es un bug real | Ignorar, continuar |
| **Bug real** | Hay un error real en la implementación | Delegar a @code-writer con el detalle exacto |
| **Estructural** | El problema requiere rediseño o reorganización de archivos | Delegar a @decomposer para re-planificar |

### Paso 3: Iterar si es necesario
Si se delegaron correcciones a @code-writer o @decomposer:
- Esperar a que completen
- Volver al Paso 1 (re-verificar con @verifier)
- Máximo 2 iteraciones totales

### Paso 4: Avanzar a QA
Solo cuando NO haya hallazgos pendientes (todos falsos positivos o todos corregidos):
- Delegar a @qa-validator para build + tests

---

## Reglas importantes

1. **No leer archivos manualmente**: La revisión de código la hace @verifier, no el orquestador
2. **No saltar pasos**: Este paso es OBLIGATORIO. No pasar a QA sin antes pasar por @verifier. Saltarse esta verificación causa BUILD FALLIDOS y E2E ROTOS.
3. **No improvisar**: Seguir exactamente este protocolo, no inventar nuevos pasos
4. **Anti-loop**: Máximo 2 iteraciones de verificación-corrección. Si persiste, escalar a @decomposer

## Nota importante
code-writer YA NO ejecuta verificación alguna. Toda la validación post-escritura (contratos, imports, boilerplate, game loop, integración) es responsabilidad exclusiva de @verifier.