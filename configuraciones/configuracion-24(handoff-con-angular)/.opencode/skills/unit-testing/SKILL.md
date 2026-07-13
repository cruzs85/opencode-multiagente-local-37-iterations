---
name: unit-testing
description: Protocolo para crear, ejecutar y diagnosticar pruebas unitarias con Jasmine/Jest en Angular 21+. Úsalo cuando necesites verificar lógica de servicios, componentes, pipes o directivas mediante tests unitarios.
---

# OBJETIVO

Garantizar la correcta verificación de la lógica del código mediante pruebas unitarias, manejando tres escenarios:
- Crear tests cuando no existen
- Ejecutar tests cuando ya existen
- Diagnosticar fallos y determinar si son del test o de la implementación

---

# REGLAS OBLIGATORIAS

## 1. Verificación de existencia

Antes de cualquier acción, verificar si el archivo `.spec.ts` existe:

```bash
find src/app -name "<nombre>.spec.ts" 2>/dev/null
```

## 2. Si NO existe → CREAR

Delegar a @code-writer la creación del archivo `.spec.ts` con:

- **Estructura:** `describe()`, `beforeEach()` con TestBed.configureTestingModule, `it()` para cada caso
- **Cobertura mínima:**
  - 1 caso feliz (happy path)
  - 1 caso borde (edge case)
  - 1 caso de error (si aplica)
- **Para servicios:** Usar `TestBed.inject()` + `inject()` de Angular
- **Para componentes:** Configurar TestBed con standalone: true, imports necesarios
- **Para signals:** Verificar valores con `signal()` y `set()`, probar `computed()` y `effect()`
- **Estilo:** Usar `fakeAsync()` y `tick()` para operaciones asíncronas
- **Ubicación:** Mismo directorio que el archivo de producción

## 3. Si SÍ existe → EJECUTAR

```bash
npm test -- --testPathPattern=<nombre>.spec.ts
```

## 4. Si EJECUCIÓN FALLA → DIAGNOSTICAR

Reglas de diagnóstico:

| Síntoma | Causa | Acción |
|---------|-----|--------|
| `Property 'X' does not exist on type 'Y'` | El test usa una API que cambió | **Fallo del test** → modificar `.spec.ts` |
| `Expected X to equal Y` donde X es valor real incorrecto | La implementación devuelve valor incorrecto | **Fallo de implementación** → corregir producción |
| `Cannot read property of undefined` en el test | Mock incompleto o datos mal formados | **Fallo del test** → actualizar mocks |
| `Timeout - Async callback` | Operación asíncrona no resuelta | **Fallo del test** → ajustar fakeAsync/tick |
| Error de compilación TypeScript en el spec | Firma de método desactualizada en test | **Fallo del test** → actualizar firma |

## 5. Fingerprint del fallo (anti-loop)

Formato:
```
UT::<archivo-spec>::<nombre-test>::<mensaje-error>
```

Si el fingerprint reaparece tras 1 corrección:
- NO re-delegar al mismo agente
- Escalar a @decomposer

## 6. Límites de iteración

- Máximo 2 correcciones por tarea
- Máximo 1 análisis de Root Cause por @decomposer
- Si persiste tras 2 correcciones → BLOCKED

---

# FORMATO DE REPORTE

## Éxito
```
✅ UNIT TESTS EXITOSOS:
- Archivo: <spec>
- Pruebas: <pasadas/totales>
- Tiempo: <duración>
```

## Fallo diagnosticado
```
❌ UNIT TEST FALLIDO:
- Archivo: <spec>
- Test: <nombre>
- Error: <mensaje>
- Diagnóstico: [Fallo del test | Fallo de implementación]
- Acción: <descripción de la corrección>
```

## BLOCKED
```
ESTADO: BLOCKED
CAUSA: Unit test failure persistente
FINGERPRINT: UT::<spec>::<test>::<error>
INTENTOS: <número>
```

---

# PROHIBICIONES

- ❌ NO editar código de producción (solo `*.spec.ts`)
- ❌ NO ejecutar más de 2 iteraciones de corrección
- ❌ NO re-enviar el mismo fingerprint
- ❌ NO ignorar tests fallidos

---

# REFERENCIAS

- Angular TestBed API
- Jasmine framework (describe, it, expect, beforeEach)
- fakeAsync / tick para tests asíncronos
- signals testing: signal(), computed(), effect()