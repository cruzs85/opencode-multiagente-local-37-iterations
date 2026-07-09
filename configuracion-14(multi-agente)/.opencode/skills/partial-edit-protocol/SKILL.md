---
name: partial-edit-protocol
description: Protocolo para delegar modificaciones parciales de archivos a code-writer sin ambigüedad. Úsala cuando necesites que code-writer modifique solo una parte de un archivo existente, ya sea .ts, .json, .md, .html, .scss o cualquier otro.
---

# Partial Edit Protocol

## Objetivo
Evitar que code-writer malinterprete instrucciones de edición parcial, suprimiendo o sobrescribiendo contenido que debería mantenerse intacto.

## Regla de oro
**Nunca asumas que code-writer infiere qué parte debe conservarse.**
Siempre debes especificar explícitamente los límites del cambio.

## Cuándo usarla
Siempre que delegues a code-writer la modificación de UNA PARTE de un archivo existente (no la creación completa ni el reemplazo total).

---

## Cómo describir el cambio según el tamaño del archivo

### Caso A: Archivo pequeño (< 50 líneas o < 2000 caracteres)
Muestra el contenido COMPLETO del archivo actual y el COMPLETO del archivo modificado. Usa "Debe quedar:" seguido del archivo completo.

✅ Correcto:
```
Archivo: ejemplo.ts

ACTUAL:
import { Component } from '@angular/core';
...

DEBE QUEDAR:
import { Component, signal } from '@angular/core';
...
```

### Caso B: Archivo mediano/grande (≥ 50 líneas)
Muestra SOLO el fragmento relevante, pero con:
1. **Números de línea** de referencia
2. **3-5 líneas de contexto** ANTES y DESPUÉS del cambio
3. Marcadores `← INICIO CAMBIO` y `← FIN CAMBIO`
4. Frase explícita: "Todo el resto del archivo debe mantenerse intacto."

✅ Correcto:
```
Archivo: game.service.ts (120 líneas total)

Cambio en líneas 42-45:

  // updateScore() ← CONTEXTO (línea 40)
  // checkCollision() ← CONTEXTO (línea 41)
  jump() {            ← INICIO CAMBIO
    this._jumping.set(true);
    this._velocity.set(-14);
  }                   ← FIN CAMBIO
  // render() ← CONTEXTO (línea 47)
  // updateObstacles() ← CONTEXTO (línea 48)

Todo el resto del archivo (líneas 1-41 y 46-120) debe mantenerse intacto.
```

❌ Incorrecto (causó el error del qa-validator):
```
Prompt actual (solo la parte final):    ← AMBIGUO
NUNCA edites archivos directamente.
CRITERIO DE ÉXITO: ...

Debe quedar:
NUNCA edites archivos directamente.
CRITERIO DE ÉXITO: ... (sin afterNextRender)
```

### Caso C: Archivo JSON con prompts de agentes
Siempre mostrar el prompt COMPLETO (suele ser < 100 líneas). Indicar exactamente qué línea o frase cambia. Usar node -e programático.

---

## Checklist para el delegante

Antes de enviar la tarea a code-writer, verifica:

- [ ] ¿Mostré el contexto completo del fragmento a modificar?
- [ ] ¿Incluí números de línea si el archivo es grande?
- [ ] ¿Usé la frase "Todo el resto del archivo debe mantenerse intacto"?
- [ ] ¿Evité atajos como "(solo la parte final)" o "...contenido intermedio omitido..."?
- [ ] Si es JSON: ¿cargué json-safe-edit y usé node -e?

## Anti-patrones

❌ "Actual (trozos intermedios omitidos)..." → genera ambigüedad
❌ "Debe quedar similar pero con X" → "similar" no es ejecutable
❌ Indicar el cambio sin decir qué conservar → code-writer asume reemplazo total
