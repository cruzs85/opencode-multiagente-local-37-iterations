---
name: e2e-protocol
description: Protocolo anti-loop para validación E2E funcional con Playwright.
---

# OBJETIVO

Garantizar validaciones E2E determinísticas evitando ciclos entre:
- @e2e-validator
- @code-writer
- @decomposer

---

# REGLAS OBLIGATORIAS

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
- 1 corrección por @code-writer
- 1 análisis por @decomposer

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

## @e2e-validator NO puede:

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

1. **El @e2e-validator DEBE asegurarse de que no queden procesos hijos en segundo plano.**

2. **Comprobar y eliminar procesos restantes en el puerto 4200 tras finalizar:**
   ```bash
   npx kill-port 4200 2>/dev/null || true
   ```

3. **En cada delegación al @code-writer, recordarle que cierre procesos previos:**
   Incluir siempre la línea:
    > "Antes de iniciar, asegúrate de matar cualquier proceso previo en el puerto 4200: `npx kill-port 4200 2>/dev/null || true`"

4. **Si el @e2e-validator inicia un servidor con `ng serve &`, DEBE matarlo explícitamente al terminar.**

## Formato de conclusión con limpieza

Al final del reporte E2E, añadir una línea:

```
🧹 Limpieza: [servidor detenido / no aplica / error al detener]
```

## Razón
El servidor `ng serve` iniciado en background por el test no se detiene solo, y al estar en una terminal sin acceso directo, queda como proceso zombie ocupando el puerto.