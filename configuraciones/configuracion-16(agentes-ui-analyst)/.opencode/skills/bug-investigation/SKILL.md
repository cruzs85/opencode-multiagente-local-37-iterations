# Skill: bug-investigation

## Objetivo
Protocolo de investigación de bugs para ahorrar tokens. Define cuándo el orquestador investiga directamente y cuándo delega a @explorer, junto con el formato de reporte que explorer debe devolver.

---

## Para el ORQUESTADOR — Árbol de decisión

Cuando el usuario reporte un comportamiento incorrecto en la app, clasifica el bug:

### Bug ACOTADO
**Características:**
- Sospecha clara de 1 solo archivo
- Síntoma específico y localizado
- Ej: "el botón no se ve", "el texto está mal alineado"

**Acción:** Lee el archivo sospechoso DIRECTAMENTE y resuelve. No delegues a explorer.

### Bug DIFUSO
**Características** (cualquiera de estas):
- Involucra 2+ archivos (ej: servicio + componente)
- El flujo de datos cruza servicio y componente
- Es un error de integración o lógica distribuida
- No está claro dónde está la causa raíz
- Ej: "los obstáculos no aparecen", "la puntuación no coincide", "el movimiento se siente incorrecto"

**Acción:**
1. DELEGA a @explorer la investigación
2. Proporciónale: síntoma observable, archivos que creas relevantes (rutas completas), hipótesis inicial
3. Pídele que cargue esta skill ('bug-investigation') para saber el formato de reporte
4. Cuando recibas su reporte, diseña la solución y delega la corrección a @code-writer

---

## Para @explorer — Formato de reporte obligatorio

Cuando el orquestador te delegue una investigación de bug, DEBES cargar esta skill y devolver el reporte en EXACTAMENTE este formato:

```
📋 REPORTE DE INVESTIGACIÓN DE BUG

🔍 Hipótesis investigada: [hipótesis que recibiste]

📁 Archivos revisados:
1. [ruta/archivo.ts] — [qué hace, líneas relevantes]
2. ...

🔬 Hallazgos:
| Archivo | Línea | Valor actual | Valor esperado | Tipo |
|---|---|---|---|---|
| ruta.ts | 42 | `código actual` | `código esperado` | lógica/sintaxis/integración |

🎯 Causa raíz:
[explicación de 1-3 líneas de por qué ocurre el bug]

💡 Solución propuesta:
[qué cambiar, en qué archivo, en qué línea]
```

**Reglas de investigación:**
1. Lee los archivos que el orquestador te indique
2. Si encuentras el bug, detén la búsqueda (no sigas revisando archivos adicionales sin necesidad)
3. Si después de revisar los archivos sugeridos no encuentras el bug, revisa archivos relacionados (imports, dependencias)
4. Máximo 3 intentos de búsqueda. Si no encuentras nada, reporta "No se encontró la causa raíz en los archivos investigados"
5. No modifiques ningún archivo — solo reportas