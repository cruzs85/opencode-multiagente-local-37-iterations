---
name: post-implementation
description: Protocolo de verificación post-implementación. build carga esta skill cuando code-writer completa un lote de escritura. Define los pasos para orquestar la verificación con @verifier y decidir si pasar a QA o iterar.
---

# Post-Implementation Protocol

## Objetivo
Verificar que los cambios implementados por code-writer son correctos ANTES de pasar a QA. Este protocolo lo ejecuta build.

## Cuándo cargarla
Después de que code-writer complete un lote de escritura de archivos, y ANTES de delegar a qa-validator.

---

## Flujo obligatorio

### Paso 1: Delegar a @verifier

Pide a @verifier que verifique los archivos modificados. build pasa la ruta del handoff JSON que code-writer creó para verifier.

### Paso 2: Recibir y actuar según el reporte

@verifier devuelve hallazgos clasificados. Según la clasificación:

| Clasificación | Significado | Acción de build |
|---|---|---|
| **Falso positivo** | No es un bug real | Ignorar, continuar |
| **Bug real** | Error en la implementación | Delegar a @code-writer vía handoff con el detalle exacto |
| **Estructural** | Requiere rediseño o reorganización | Delegar a @decomposer para re-planificar |

### Paso 3: Iterar si es necesario

Si se delegaron correcciones:
- Esperar a que code-writer o decomposer completen
- Volver al Paso 1 (re-verificar con @verifier)
- Máximo 2 iteraciones totales

### Paso 4: Avanzar a QA

Solo cuando NO haya hallazgos pendientes (todos falsos positivos o todos corregidos):
- Delegar a @qa-validator con la ruta del handoff JSON de verifier

---

## Reglas importantes

1. **No leer archivos manualmente**: La revisión la hace @verifier, no build
2. **No saltar pasos**: Este paso es OBLIGATORIO. No pasar a QA sin verifier
3. **Máximo 2 iteraciones** de verificación-corrección. Si persiste, escalar al usuario
4. **build NUNCA** envía el contenido del handoff en el prompt. Pasa solo la ruta del disco.
   ⚠️ Si build incluye listas de archivos, verificaciones o cualquier contenido
   del handoff en el prompt, el verifier IGNORARÁ el handoff JSON y trabajará
   con las instrucciones en texto plano, rompiendo el protocolo de delegación.
   Para evitarlo: el prompt de la task debe decir solo "Lee el handoff en
   [ruta] y ejecuta tu protocolo de verificación. Al completar, escribe tu
   handoff de salida." Sin listas, sin detalles, sin checks.
