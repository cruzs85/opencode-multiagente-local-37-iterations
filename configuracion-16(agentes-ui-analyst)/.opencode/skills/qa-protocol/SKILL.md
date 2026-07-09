---
name: qa-protocol
description: Protocolo de validación técnica y anti-loop para el Proyecto.
---

# OBJETIVO

Validar integridad técnica evitando ciclos infinitos entre:
- @qa-validator
- @code-writer
- @decomposer

---

# VALIDACIÓN TÉCNICA

## Standalone Check
Confirmar que no se hayan introducido `NgModules`.

## Injection Check
Toda nueva dependencia debe usar `inject()`.

## Signal Integrity
Los `effect()` no deben generar ciclos reactivos.

## SSR Safety (aplica a Leaflet, Canvas, DOM APIs)
Toda referencia a APIs del navegador (\`window\`, \`document\`, librerías que acceden al DOM) 
debe ejecutarse dentro de `afterNextRender()`.

---

# VALIDACIÓN FUNCIONAL

## Canvas / DOM (reemplaza a Mapa en juegos)
El contenedor Canvas debe tener dimensiones explícitas (width/height).

## IndexedDB
Las operaciones deben:
- ser async
- manejar quota exceeded
- manejar fallos transaccionales

## Signals
Los cambios de estado deben reflejarse sin recarga manual.

---

# VALIDACIÓN OBLIGATORIA

## Regla crítica

Está PROHIBIDO aprobar cambios sin ejecutar:

```bash
npm run build
```

Sin errores ni warnings de TypeScript.

---

# LÍMITES DE ITERACIÓN

## Regla estricta

Máximo:
- 3 iteraciones totales por tarea
- 2 correcciones por @code-writer
- 1 análisis de Root Cause por @decomposer

Secuencia permitida:

1. Ejecutar `npm run build`
2. Detectar errores
3. Delegar corrección a @code-writer (máx 2 veces)
4. Reejecutar `npm run build`
5. Si el error persiste tras segunda corrección:
   - Solicitar Root Cause Analysis a @decomposer
   - Si aún falla → marcar como BLOCKED

---

# PROTOCOLO DE ESCALADO

## Escalar a @decomposer SOLO si:

- El mismo error reaparece tras la segunda corrección
- El error es de arquitectura (no de sintaxis)
- No se puede determinar la causa raíz

---

## Información obligatoria para escalado

Enviar SIEMPRE:

- Comando ejecutado
- Log completo del error
- Archivo(s) afectado(s)
- Línea(s) exacta(s) del error
- Intentos de corrección realizados
- Stack trace completo

---

# PROTOCOLO DE ESCALADO A @RESEARCHER

## Escalar a @researcher SOLO si:

- El error involucra una API externa no documentada
- Se necesita investigar una nueva librería o SDK
- No hay documentación disponible en el codebase

---

# PROHIBICIONES

## @qa-validator NO puede:

- Editar archivos de implementacion (prohibido)
- Editar archivos *.spec.ts y *.e2e.spec.ts (PERMITIDO - para corregir tests)
- Aprobar cambios sin ejecutar npm run build
- Validar leyendo archivos manualmente
- Ejecutar mas de 3 iteraciones
- Delegar el mismo error dos veces al mismo agente
- Ignorar warnings de TypeScript
- Auto-invocarse con task()
---

## @qa-validator DEBE:
- Ejecutar SIEMPRE `npm run build` antes de cualquier conclusion
- Clasificar errores: [Sintaxis], [Arquitectura], [Logica]
- Delegar correcciones a @code-writer con contexto claro
- Verificar que todo uso de APIs del navegador este dentro de `afterNextRender()`
- Verificar que no se hayan introducido NgModules
---
1. El mismo error persiste tras:
   - 2 correcciones por @code-writer
   - 1 Root Cause Analysis por @decomposer

2. No hay suficiente información para resolver el error

3. El error requiere intervención humana (ej: configuración de infraestructura)

---

## Formato de cierre BLOCKED

```
ESTADO: BLOCKED
CAUSA: <descripción concisa>
ERROR: <mensaje exacto>
INTENTOS: <número>
LOG: <resumen del último error>
```

---

# EJEMPLOS DE VALIDACIÓN

## Ejemplo 1: Validación exitosa

```
@qa-validator: Ejecutando npm run build...
[salida: ✓ Build exitoso, 0 warnings]

✅ Validación aprobada:
- Build: exitoso
- TypeScript: sin errores
- Standalone: verificado
- Signals: correctos
- Inyección: correcta
```

---

## Ejemplo 2: Error de inyección

```
@qa-validator: Ejecutando npm run build...
[salida: ERROR src/app/component.ts:15: Constructor should use inject()]

❌ Validación fallada:
- Error: Constructor usado para inyección
- Archivo: src/app/component.ts:15

Delegando a @code-writer:
"Reemplazar constructor por inject() en ComponentName"
Referencia: angular-architecture.md sección "INYECCIÓN DE DEPENDENCIAS"
```

---

## Ejemplo 3: Error de SSR

```
@qa-validator: Ejecutando npm run build...
[salida: ERROR src/app/map.ts:23: ReferenceError: window is not defined]

❌ Validación fallada:
- Error: Referencia a window sin afterNextRender()
- Archivo: src/app/map.ts:23

Delegando a @code-writer:
"Envolver referencia a window en afterNextRender()"
Referencia: angular-architecture.md sección "SEGURIDAD SSR"
```

---

# INTEGRACIÓN CON AGENTES

## Flujo con @code-writer

1. @code-writer implementa cambios
2. @qa-validator ejecuta `npm run build`
3. Si hay errores → delegar a @code-writer
4. Repetir hasta máximo 2 correcciones
5. Si persiste → escalar a @decomposer

---

## Flujo con @decomposer

1. @decomposer analiza Root Cause
2. Propone plan de corrección
3. @code-writer implementa
4. @qa-validator valida nuevamente

---

# FLUJO UNIFICADO QA

El qa-validator ahora integra las responsabilidades de unit-tester y e2e-validator.

Una vez que el build es exitoso, qa-validator:

1. **Clasifica el cambio** usando qa-decision-engine
2. **Determina qué pruebas ejecutar** según el tipo de cambio:
   - Unit tests (carga skill `unit-testing`)
   - E2E tests (carga skill `e2e-protocol`)
   - Ambos
   - Ninguno (solo build)
3. **Crea tests si no existen** (delegando a @code-writer)
4. **Ejecuta tests existentes**
5. **Diagnostica fallos** (distingue entre fallo del test y fallo de implementación)
6. **Reporta resultados consolidados**

Límites: máx 3 iteraciones build + máx 2 iteraciones por tipo de test.

---

*Este protocolo debe ser seguido estrictamente por @qa-validator. Referencias cruzadas: angular-architecture.md, e2e-protocol.md, unit-testing.md, qa-decision-engine.md*