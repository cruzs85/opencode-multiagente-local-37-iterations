---
name: e2e-protocol
description: Protocolo anti-loop para validación E2E funcional con Playwright.
---

# OBJETIVO

Garantizar validaciones E2E determinísticas evitando ciclos entre:
- @qa-validator
- @code-writer
- @decomposer

---

# REGLAS OBLIGATORIAS

## ⚠️ Pre-check: Playwright Config (OBLIGATORIO)

Antes de ejecutar `npx playwright test`, el qa-validator DEBE:

1. **Leer playwright.config.ts** y verificar que existe `webServer`:
   ```bash
   grep "webServer" playwright.config.ts
   ```
2. **Verificar** que `webServer` contiene:
   - `command`: comando que sirve la app (http-server, ng serve, etc.)
   - `url`: URL donde escucha la app (ej: `http://localhost:4200`)
   - `reuseExistingServer: true` (no reiniciar servidor en cada test)
3. **Si falta alguno** → crear handoff tipo `"correccion"` para code-writer:
   ```
   "Añadir webServer a playwright.config.ts con: command, url y reuseExistingServer: true"
   ```
4. **NO ejecutar E2E hasta que webServer esté configurado**. Si no se puede corregir, escalar a build.

## 1. Ownership único del fallo

Cada fallo detectado debe generar un único responsable:

- [ui-renderizado] → @code-writer
- [datos-incorrectos] → @code-writer
- [lógica-de-negocio] → @decomposer

PROHIBIDO reenviar el mismo fallo a diferentes agentes.

---

## 2. Fingerprint del fallo

Antes de delegar una corrección, generar un fingerprint:

Formato:

E2E::<archivo-spec>::<nombre-test>::<mensaje-error>

Ejemplo:

E2E::login.spec.ts::should login::locator timeout button submit

Si el fingerprint reaparece:
- NO volver a delegar al mismo agente.
- Escalar inmediatamente.

---

# LÍMITES DE ITERACIÓN

## Regla estricta

Máximo:
- 3 iteraciones totales por tarea (unificado)
- 2 correcciones por @code-writer
- 1 análisis por @decomposer (solo si persiste)

Secuencia permitida:

1. Ejecutar Playwright
2. Detectar fallo
3. Delegar UNA vez
4. Reejecutar Playwright
5. Si falla el MISMO fingerprint:
   - TERMINAR
   - Escalar
   - NO reintentar

---

# PROTOCOLO DE ESCALADO

## Escalar a @decomposer SOLO si:

- El fallo es [lógica-de-negocio]
- O el mismo fingerprint reaparece tras corrección

---

## Información obligatoria para escalado

Enviar SIEMPRE:

- archivo spec
- nombre del test
- mensaje completo
- stack trace
- screenshot exacto
- pasos reproducibles
- fingerprint

---

# PROHIBICIONES

## @qa-validator NO puede:

- editar archivos
- sugerir cambios vagos
- reenviar errores sin fingerprint
- ejecutar más de 2 corridas Playwright por tarea
- delegar el mismo fingerprint dos veces

---

# REGLA DE CIERRE

Si el mismo fingerprint persiste tras:
- 1 corrección
- 1 rerun

La tarea debe marcarse como:

ESTADO: BLOCKED
CAUSA: Persistent E2E failure

y finalizar inmediatamente.

---

# CRITERIO DE ÉXITO

Una validación E2E válida requiere:

- mínimo 1 ejecución real de Playwright
- máximo 2 ejecuciones
- ausencia de fingerprints repetidos
- evidencia de screenshot/log cuando exista fallo

---

# REGLA DE CIERRE POSITIVO

## ÉXITO FUNCIONAL

Cuando todas las pruebas pasen:

1. **TERMINAR INMEDIATAMENTE después de confirmación**:
   - NO ejecutar toolcalls adicionales (ej: 'read' para verificar)
   - NO generar reportes adicionales
   - NO validaciones redundantes

3. **Formato de conclusión obligatorio**:
   ```
   ✅ VALIDACIÓN E2E EXITOSA:
   - Pruebas ejecutadas: [número]
   - Pruebas pasadas: [número]
   - Video generado: [sí/no]
   - Objetivo alcanzado: [sí/no]
   - Toolcalls adicionales: [cero]
   ```

---

# REGLA ANTI-OPTIONAL

## NO INICIAR NUEVOS WORKFLOWS TRAS ÉXITO

Cuando se alcanza éxito funcional:

- ❌ NO usar 'read' para verificar resultados
- ❌ NO generar screenshots adicionales
- ❌ NO crear reportes extendidos
- ❌ NO ejecutar 'show-report' si no se solicitó
- ✅ TERMINAR con resumen conciso

---

# CRITERIO DE ÉXITO E2E (ACTUALIZADO)

Una validación E2E válida requiere:

- mínimo 1 ejecución real de Playwright
- máximo 2 ejecuciones (solo en caso de retry)
- **0 toolcalls adicionales tras éxito**
- resumen conciso en lugar de validaciones exhaustivas

---

# REGLA DE LIMPIEZA DE PROCESOS (OBLIGATORIO)

## Al finalizar la validación E2E (éxito o fracaso):

1. **El @qa-validator DEBE asegurarse de que no queden procesos hijos en segundo plano.**

2. **Comprobar y eliminar procesos restantes en el puerto 4200 tras finalizar:**
   ```bash
   npx kill-port 4200 2>/dev/null || true
   ```

3. **En cada delegación al @code-writer, recordarle que cierre procesos previos:**
   Incluir siempre la línea:
    > "Antes de iniciar, asegúrate de matar cualquier proceso previo en el puerto 4200: `npx kill-port 4200 2>/dev/null || true`"

4. **Si el @qa-validator inicia un servidor con `ng serve &`, DEBE matarlo explícitamente al terminar.**

## Formato de conclusión con limpieza

Al final del reporte E2E, añadir una línea:

```
🧹 Limpieza: [servidor detenido / no aplica / error al detener]
```

## Razón
El servidor `ng serve` iniciado en background por el test no se detiene solo, y al estar en una terminal sin acceso directo, queda como proceso zombie ocupando el puerto.

---

# NUEVAS SECCIONES PARA FLUJO UNIFICADO QA

## Creación de tests E2E si no existen

Si al ejecutar `npx playwright test` no se encuentra el spec o el test específico:

1. Verificar existencia del archivo:
   ```bash
   find . -name "*.e2e.spec.ts" -o -name "*.spec.e2e.ts" 2>/dev/null
   ```

2. Si NO existe → Delegar a @code-writer con:
   - Funcionalidad a testear
   - Flujo de usuario (navegación, interacción, validación)
   - Casos: feliz, error, borde
   - Ubicación estándar: `e2e/` o junto al componente

3. Si SÍ existe pero el test específico no → Añadir nuevo `test()` al spec existente

## Diagnóstico de fallos E2E

| Síntoma | Causa | Acción |
|---------|-----|--------|
| `locator: Timeout 5000ms` | Selector CSS desactualizado | **Fallo del test** → actualizar selector |
| `page.goto: net::ERR_CONNECTION_REFUSED` | Servidor no iniciado | **Fallo de infra** → iniciar servidor |
| `page.goto: net::ERR_*` | Ruta no existe o cae | **Fallo de implementación** → corregir ruta/backend |
| Screenshot: UI con datos incorrectos | Lógica de negocio errónea | **Fallo de implementación** → corregir producción |
| Screenshot: página en blanco | Componente no renderiza | **Fallo de implementación** → corregir componente |
| `expect(locator).toHaveText` falla | Texto dinámico cambiado | **Fallo del test** → actualizar expectativa |

## Fingerprint E2E (anti-loop extendido)

Formato:
```
E2E::<archivo-spec>::<nombre-test>::<mensaje-error>
```

Reglas:
- Máximo 2 ejecuciones de Playwright por tarea
- 2 correcciones por @code-writer
- Si el mismo fingerprint reaparece → BLOCKED + escalar a @decomposer

## Integración con qa-decision-engine

Este protocolo es cargado por qa-validator cuando el árbol de decisión
(clasificador) determina que el cambio requiere validación E2E.

El flujo completo es:
1. qa-validator ejecuta build → OK
2. qa-validator carga qa-decision-engine → clasifica → [E2E requerido]
3. qa-validator carga e2e-protocol
4. qa-validator ejecuta los pasos de este protocolo
5. qa-validator reporta resultados al reporte consolidado