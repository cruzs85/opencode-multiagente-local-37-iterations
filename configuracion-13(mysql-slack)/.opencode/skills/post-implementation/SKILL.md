---
name: post-implementation
description: Protocolo de verificación post-implementación para el orquestador. Define los pasos a seguir después de que code-writer complete un lote de cambios y antes de pasar a QA. Cárgala cuando code-writer haya terminado de escribir archivos.
---

# Post-Implementation Protocol

## Objetivo
Verificar que los cambios implementados por code-writer son correctos ANTES de pasar a la fase de QA. Esto evita ciclos innecesarios de build fallidos.

## Cuándo usarla
Después de que code-writer complete un lote de escritura de archivos, y ANTES de delegar a qa-validator.

---

## Flujo de verificación

### Paso 1: Delegar a @explorer
Pide a @explorer que verifique los siguientes puntos sobre los archivos modificados:

**a. Código huérfano**
- Métodos, variables o imports que hayan quedado sin callsite
- Código eliminado que haya dejado referencias rotas
- Listeners, imports o props que ya no se usen

**b. Contratos entre archivos**
- Los nombres de métodos, propiedades, tipos e interfaces sean consistentes entre los archivos modificados y los que dependen de ellos
- Ej: si se añadió una nueva signal pública en un servicio, el componente que la consume debe tener el import y la referencia correcta

**c. Boilerplate Angular**
- `standalone: true` en todos los componentes
- `styleUrl` (singular, no `styleUrls`)
- APIs del navegador (window, document, canvas) usadas SOLO dentro de `afterNextRender`
- Inyección de dependencias con `inject()`, no por constructor

**d. Game loop (si aplica)**
- `deltaTime` para movimientos frame-independientes (si se usa)
- Coordenadas Y consistentes con el sistema de coordenadas del canvas

**e. Integración servicio-componente (si aplica)**
Si el lote incluye un servicio con lógica de negocio y un componente que lo consume, indica a @explorer que cargue la skill 'integration-verification' y siga sus 5 pasos para verificar la cadena de llamadas completa, detectar métodos huérfanos y validar el flujo de datos desde el evento de usuario hasta la actualización visual.

### Paso 2: Recibir y clasificar el reporte
Cuando @explorer responda, clasifica cada hallazgo:

| Clasificación | Significado | Acción |
|---|---|---|
| **Falso positivo** | El hallazgo no es un bug real (ej: explorer malinterpretó la lógica) | Ignorar, continuar |
| **Bug real** | Hay un error real en la implementación | Delegar a @code-writer con el detalle exacto |
| **Estructural** | El problema requiere rediseño o reorganización de archivos | Delegar a @decomposer para re-planificar |

### Paso 3: Iterar si es necesario
Si se delegaron correcciones a @code-writer o @decomposer:
- Esperar a que completen
- Volver al Paso 1 (re-verificar con @explorer)
- Máximo 2 iteraciones totales

### Paso 4: Avanzar a QA
Solo cuando NO haya hallazgos pendientes (todos falsos positivos o todos corregidos):
- Delegar a @qa-validator para build + tests

### Paso 5: Flujo posterior
Si qa-validator reporta éxito → delegar a @e2e-validator
Si e2e-validator reporta éxito → notificar a Slack según skill 'notifications' (tipo ✅ completado)

---

## Reglas importantes

1. **No leer archivos manualmente**: La revisión de código la hace @explorer, no el orquestador
2. **No saltar pasos**: No pasar a QA sin antes pasar por esta verificación
3. **No improvisar**: Seguir exactamente este protocolo, no inventar nuevos pasos
4. **Anti-loop**: Máximo 2 iteraciones de verificación-corrección. Si persiste, escalar a @decomposer
