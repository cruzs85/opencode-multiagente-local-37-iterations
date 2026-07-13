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

> **⚠️ Causa técnica de fondo:** cada invocación de `bash` es un proceso shell independiente. Los procesos lanzados con `&` en segundo plano mueren en cuanto termina ese shell. Por eso Playwright DEBE gestionar su propio servidor vía `webServer` en `playwright.config.ts`; nunca lanzar servidores manuales con `&` entre toolcalls.

> **⚠️ Causa JIT mode:** si `testDir` apunta a `./src` y NO hay `testMatch`, Playwright escanea todos los `*.spec.ts` (unit tests de Angular), que fallan con `Standard Angular field decorators are not supported in JIT mode`. La solución es `testDir: './e2e'` con `testMatch: '**/*.e2e.spec.ts'`.

1. **Verificar que existe el directorio e2e/**:
   ```bash
   ls -d e2e/ 2>/dev/null && echo "OK" || echo "NO_EXISTE: e2e/"
   ```
   Si no existe → crearlo o reportar a build.

2. **Listar archivos de test E2E**:
   ```bash
   find . -name "*.e2e.spec.ts" -o -name "*.spec.e2e.ts" 2>/dev/null | head -20
   ```
   Si no hay archivos → delegar a code-writer para crearlos.

3. **Leer playwright.config.ts** y verificar:
   ```bash
   grep -E "testDir|testMatch|webServer" playwright.config.ts
   ```
4. **Verificar** que:
   - `testDir` apunta a `'./e2e'` (NO `'./src'`)
   - `testMatch` existe con `'**/*.e2e.spec.ts'`
   - `webServer` contiene:
     - `command`: comando que sirve la app (http-server, ng serve, etc.)
     - `url`: URL donde escucha la app (ej: `http://localhost:4200`)
     - `reuseExistingServer: true` (no reiniciar servidor en cada test)
5. **Si falta testMatch o testDir apunta a ./src** → crear handoff tipo `"correccion"` para code-writer:
   ```
   "Corregir playwright.config.ts: cambiar testDir a './e2e' y añadir testMatch: '**/*.e2e.spec.ts'. Esto evita que Playwright procese unit tests de Angular como E2E."
   ```
6. **Si falta webServer o está mal configurado** → crear handoff tipo `"correccion"` para code-writer:
   ```
   "Añadir webServer a playwright.config.ts con: command, url y reuseExistingServer: true"
   ```
   NO intentes usar http-server manual como alternativa. Siempre corrige la config.
7. **NO ejecutar E2E hasta que webServer esté configurado y responda.** 
   Verifica con: `curl -s http://localhost:4200 | grep -q "app-root"` 
   Si curl no responde → NO re-ejecutar tests. Diagnosticar servidor.
8. **PROHIBICIÓN ABSOLUTA de http-server manual:**
   - NO inicies `http-server` en background con `&`.
   - NO uses `nohup` ni `ng serve &`.
   - El servidor en background NO es confiable para E2E porque cada toolcall bash es un shell nuevo que no preserva procesos hijo.
   - Playwright DEBE gestionar el servidor vía webServer en playwright.config.ts.
   - Excepción: solo si webServer falla y build lo autoriza explícitamente. En ese caso, encadenar server + tests + kill en UNA sola llamada bash.

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
   - Ubicación estándar: SIEMPRE `e2e/`. NUNCA junto al componente (`src/app/`).

3. Si SÍ existe pero el test específico no → Añadir nuevo `test()` al spec existente

## Diagnóstico de fallos E2E

| Síntoma | Causa | Acción |
|---------|-----|--------|
| `locator: Timeout 5000ms` | Selector CSS desactualizado | **Fallo del test** → actualizar selector |
| `page.goto: net::ERR_CONNECTION_REFUSED` | Servidor no iniciado o no responde | **Fallo de infra** → 1. Verificar webServer en playwright.config.ts. 2. curl http://localhost:4200. 3. Si no responde tras 2 intentos → escalar a build. NO reintentar más. |
| `page.goto: net::ERR_*` | Ruta no existe o cae | **Fallo de implementación** → corregir ruta/backend |
| Screenshot: UI con datos incorrectos | Lógica de negocio errónea | **Fallo de implementación** → corregir producción |
| Screenshot: página en blanco | Componente no renderiza | **Fallo de implementación** → corregir componente |
| `expect(locator).toHaveText` falla | Texto dinámico cambiado | **Fallo del test** → actualizar expectativa |
| `npx playwright test --list` reporta 0 tests | Test file no coincide con `testMatch` o está fuera de `testDir` en playwright.config.ts | **Fallo de configuración** → verificar testMatch/testDir en playwright.config.ts |
| `Standard Angular field decorators are not supported in JIT mode` | Playwright procesando unit tests de Angular (Jasmine) como E2E por falta de `testMatch` o `testDir: './src'` | **Fallo de configuración** → verificar que playwright.config.ts tenga `testDir: './e2e'` y `testMatch: '**/*.e2e.spec.ts'`. Delegar a code-writer si es necesario. |

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