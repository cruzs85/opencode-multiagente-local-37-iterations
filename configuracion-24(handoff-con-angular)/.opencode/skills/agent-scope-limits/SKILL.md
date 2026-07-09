---
name: agent-scope-limits
description: Límites de alcance para correcciones (mínimo cambio, sin refactors no solicitados)
---

# SKILL: agent-scope-limits

## Propósito
Evitar que agentes correctores (QA validator, code-writer en modo corrección) reescriban archivos más allá del cambio solicitado o introduzcan nuevas dependencias no autorizadas.

## ¿Cuándo usarla?
Siempre que un agente vaya a corregir errores en archivos existentes.

## Reglas para QA Validator

### Modo solo-reporte (OBLIGATORIO)
✅ PERMITIDO: Ejecutar `npm run build` y `npm test`
✅ PERMITIDO: Reportar errores con archivo, línea, código actual y código esperado
✅ PERMITIDO: Delegar la corrección a code-writer con instrucciones mínimas y precisas
✅ PERMITIDO: Indicar el tipo de error (Sintaxis, Arquitectura, Lógica)

❌ PROHIBIDO: Reescribir archivos completos usando bash + cat
❌ PROHIBIDO: Cambiar la estructura de datos del servicio (ej: mover señales dentro de un objeto)
❌ PROHIBIDO: Añadir dependencias nuevas no solicitadas (rxjs, BehaviorSubject, etc.)
❌ PROHIBIDO: Refactorizar métodos que no tienen errores de compilación
❌ PROHIBIDO: Cambiar la lógica de negocio para "mejorarla"

### Si un error persiste tras 3 iteraciones
1. NO reescribir el archivo
2. Escalar al decomposer con el log completo de errores
3. El decomposer determinará si se necesita un refactor estructural

## Reglas para code-writer (en modo corrección)

### Principio de mínimo cambio
✅ PERMITIDO: Crear nuevos archivos según especificación
✅ PERMITIDO: Modificar líneas específicas para corregir errores de compilación
✅ PERMITIDO: Cambiar types, firmas de métodos o imports rotos
❌ PROHIBIDO: Refactorizar código que funciona y no tiene errores
❌ PROHIBIDO: Añadir librerías no solicitadas
❌ PROHIBIDO: Cambiar la estructura de datos acordada en el plan original
❌ PROHIBIDO: Renombrar métodos o propiedades que ya funcionan

### Excepción: refactor autorizado
Un refactor solo está permitido si:
1. El decomposer lo autoriza explícitamente en el plan
2. El cambio es necesario para corregir un error de compilación
3. Se limita estrictamente al archivo y líneas con errores

## Flujo de corrección seguro

```
1. QA detecta error → reporta [archivo:línea:mensaje]
2. QA delega a code-writer con: "En [archivo], línea [N], cambiar [código actual] por [código esperado]"
3. code-writer hace el cambio MÍNIMO necesario
4. QA re-ejecuta build
5. Si el error persiste → repetir paso 2-4 (máx 3 veces)
6. Si el error sigue → escalar a decomposer
```

## Anti-patrones

❌ QA validator que reescribe game.service.ts entero cuando solo hay un error de tipo
❌ code-writer que añade BehaviorSubject + rxjs cuando el plan no los menciona
❌ Cualquier agente que haga "mejoras" no solicitadas