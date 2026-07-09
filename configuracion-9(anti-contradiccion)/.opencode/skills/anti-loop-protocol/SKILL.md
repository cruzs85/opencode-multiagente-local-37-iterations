---
name: anti-loop-protocol
description: Protocolo general de detección de loops para todos los agentes del sistema.
---

# OBJETIVO

Detectar automáticamente cuando un agente ejecuta el mismo procedimiento con exactamente el mismo resultado 2 veces consecutivas, y cancelar el procedimiento para evitar loops infinitos.

---

# REGLA GENERAL DE DETECCIÓN DE LOOPS

## Condición de activación

Si un agente ejecuta el MISMO procedimiento con EXACTAMENTE el MISMO resultado
**2 veces consecutivas**:

→ TERMINAR INMEDIATAMENTE el procedimiento
→ Reportar el fingerprint del loop detectado
→ Solicitar intervención humana o escalar al siguiente nivel

## Definición de "Mismo Procedimiento"

Se considera el mismo procedimiento si cumple TODOS estos criterios:

1. **Mismo comando/toolcall**: Misma herramienta ejecutada (grep, edit, bash, read, etc.)
2. **Mismos parámetros**: Mismos argumentos exactos o semánticamente equivalentes
   - Ejemplo equivalente: `grep "double.*jump"` ≈ `grep "doubleJump"`
   - Ejemplo NO equivalente: `grep "jump"` ≠ `grep "doubleJump"`
3. **Mismo contexto/archivos**: Mismos archivos o rutas involucradas
   - Misma ruta exacta: `src/app/app.ts`
   - Mismo patrón de archivos: `**/*.spec.ts`

## Definición de "Mismo Resultado"

Se considera el mismo resultado si cumple AL MENOS UNO de estos criterios:

1. **Mismo output/error exacto**: Texto de salida idéntico
2. **Mismo estado final**:
   - Misma cantidad de archivos encontrados
   - Misma línea de error
   - Mismo número de tests fallando
3. **Mismas modificaciones**:
   - Los archivos tienen el mismo timestamp de modificación (no hubo cambios)
   - El contenido de los archivos es idéntico al intento anterior

---

# FORMATO DE FINGERPRINT GENERAL

## Estructura obligatoria

```
AGENT::<nombre-agente>::<tipo-operación>::<contexto>::<hash-resultado>
```

Componentes:
- `AGENT`: Prefijo fijo para identificar fingerprints de agentes
- `nombre-agente`: Nombre del agente (explorer, code-writer, qa-validator, etc.)
- `tipo-operación`: Tipo de operación (grep, edit, bash, read, test, build)
- `contexto`: Contexto de la operación (archivos, rutas, parámetros clave)
- `hash-resultado`: Hash simplificado del resultado (primeros 50 chars o resumen)

## Ejemplos de Fingerprints

### @explorer - Búsqueda sin resultados
```
AGENT::explorer::grep::src/app::no_results_double_jump_abc123
AGENT::explorer::grep::src/app::no_results_superpowers_abc123
```

### @code-writer - Corrección fallida
```
AGENT::code-writer::edit::src/app/app.ts::syntax_error_def456
AGENT::code-writer::edit::src/app/app.ts::validation_failure_ghi789
```

### @qa-validator - Build fallido
```
AGENT::qa-validator::build::npm_run_build::type_error_jkl012
AGENT::qa-validator::build::npm_run_build::same_output_mno345
```

### @unit-tester - Test fallido
```
AGENT::unit-tester::test::app.spec.ts::assertion_failed_pqr678
AGENT::unit-tester::test::app.spec.ts::same_failure_stu901
```

### @e2e-validator - Test E2E fallido
```
AGENT::e2e-validator::e2e::dinosaur.spec.ts::collision_detected_vwx234
AGENT::e2e-validator::e2e::dinosaur.spec.ts::same_failure_yz567
```

---

# REGLAS DE DETECCIÓN POR TIPO DE OPERACIÓN

## 1. Operaciones de Búsqueda (grep, glob)

**Mismo procedimiento si**:
- Mismo comando: `grep` o `glob`
- Mismo patrón de búsqueda: Regex idéntico o semánticamente equivalente
- Mismos directorios/archivos a buscar

**Mismo resultado si**:
- Mismo número de archivos encontrados (incluye 0)
- Mismos archivos encontrados (mismas rutas)
- Mismo error si ocurrió

**Ejemplo de loop**:
```
Intento 1: grep "double.*jump" en src/ → 0 archivos
Intento 2: grep "doubleJump" en src/ → 0 archivos
✅ LOOP DETECTADO: Mismo resultado (0 archivos)
Fingerprint: AGENT::explorer::grep::src::no_results_doublejump_abc123
```

## 2. Operaciones de Edición (edit)

**Mismo procedimiento si**:
- Mismo comando: `edit`
- Mismo archivo a editar
- Mismas líneas o bloques a modificar
- Mismo tipo de cambio (insert, replace, delete)

**Mismo resultado si**:
- Mismo error de sintaxis
- Mismo error de validación
- El archivo tiene el mismo timestamp de modificación (no hubo cambios)

**Ejemplo de loop**:
```
Intento 1: edit src/app/app.ts líneas 122-125 → Syntax error
Intento 2: edit src/app/app.ts líneas 122-125 → Syntax error
✅ LOOP DETECTADO: Mismo error en las mismas líneas
Fingerprint: AGENT::code-writer::edit::src/app/app.ts::syntax_error_122-125_def456
```

## 3. Operaciones de Ejecución (bash, test, build)

**Mismo procedimiento si**:
- Mismo comando: `bash` con mismo comando
- Mismo script: `npm run build`, `npm test`, etc.
- Mismos argumentos de configuración

**Mismo resultado si**:
- Mismo error exacto (misma línea, mismo mensaje)
- Mismo número de tests fallando
- Mismo output de compilación

**Ejemplo de loop**:
```
Intento 1: npm run build → Error en src/app/app.ts:125
Intento 2: npm run build → Error en src/app/app.ts:125
✅ LOOP DETECTADO: Mismo error de compilación
Fingerprint: AGENT::qa-validator::build::npm_run_build::error_125_ghi789
```

---

# PROCEDIMIENTO CUANDO SE DETECTA UN LOOP

## Pasos obligatorios

1. **GENERAR FINGERPRINT**: Crear el fingerprint según el formato general
2. **TERMINAR INMEDIATAMENTE**: Detener cualquier ejecución en curso
3. **REPORTAR EL LOOP**: Formato obligatorio de reporte

## Formato de reporte de loop

```markdown
## ⚠️ LOOP DETECTADO

**Fingerprint**: AGENT::<nombre-agente>::<tipo-operación>::<contexto>::<hash-resultado>

**Intento 1**: 
- Comando: [comando/toolcall ejecutado]
- Resultado: [resultado o error]
- Timestamp: [cuando ocurrió]

**Intento 2**:
- Comando: [comando/toolcall ejecutado]
- Resultado: [resultado o error]
- Timestamp: [cuando ocurrió]

**ANÁLISIS DE EQUIVALENCIA**:
- Mismo procedimiento: [Sí/No - explicar por qué]
- Mismo resultado: [Sí/No - explicar por qué]

**ACCIÓN TOMADA**: Terminación automática por detección de loop

**RECOMENDACIÓN**:
[Proxima acción sugerida o solicitud de intervención]
```

---

# REGLAS DE TERMINACIÓN

## Terminar inmediatamente si:

1. Se detecta el mismo fingerprint 2 veces consecutivas
2. El mismo procedimiento produce el mismo resultado 2 veces
3. El contexto ha cambiado pero el resultado es idéntico (loop lógico)

## Prohibido:

1. Ejecutar un tercer intento con el mismo procedimiento
2. Intentar variaciones menores de la misma operación (está prohibido por la regla de "mismo procedimiento")
3. Cambiar solo un carácter o argumento menor y volver a intentar (esto es evasión de la regla)

---

# EXCEPCIONES A LA REGLA

## Únicas excepciones permitidas

1. **Intervención explícita humana**: Si el usuario indica explícitamente "continúa" o "reintentar", puede proceder
2. **Cambio de contexto significativo**: Si el archivo objetivo fue modificado por otro agente entre intentos
3. **Cambio de parámetros sustancial**: Los parámetros son fundamentalmente diferentes, no solo variaciones menores

## Ejemplos de excepciones válidas

**Cambio de contexto válido**:
```
Intento 1: edit src/app/app.ts → Error de sintaxis
[Cambio realizado por @code-writer en el archivo]
Intento 2: edit src/app/app.ts → Éxito (el archivo fue corregido)
✅ NO ES LOOP: El contexto cambió significativamente
```

**Cambio de parámetros válido**:
```
Intento 1: edit src/app/app.ts líneas 122-125 → Error
Intento 2: edit src/app/app.ts líneas 122-130 → Éxito (se modificó el rango)
✅ NO ES LOOP: Los parámetros son sustancialmente diferentes
```

## Ejemplos de excepciones INVÁLIDAS (evasión de la regla)

**Cambio de parámetros inválido (evasión)**:
```
Intento 1: grep "double.*jump" → 0 resultados
Intento 2: grep "doubleJump" → 0 resultados
❌ ES LOOP: Los parámetros son semánticamente equivalentes
```

**Cambio menor inválido (evasión)**:
```
Intento 1: edit src/app/app.ts línea 122 → Error
Intento 2: edit src/app/app.ts línea 122.1 → Error (línea virtual)
❌ ES LOOP: El cambio es trivial y el resultado es idéntico
```

---

# PROHIBICIONES FINALES

## Ningún agente puede:

1. Ejecutar el mismo procedimiento más de 2 veces
2. Intentar evadir la regla con cambios triviales
3. Ocultar o no reportar fingerprints de loops detectados
4. Continuar ejecutando después de detectar un loop sin intervención explícita
5. Cambiar solo un carácter o argumento menor y considerar que es un "procedimiento diferente"

---

# RESPONSABILIDAD DE IMPLEMENTACIÓN

## Cada agente debe:

1. **Mantener un registro interno** de los últimos 2 procedimientos ejecutados
2. **Comparar procedimientos** antes de ejecutar el tercero
3. **Generar fingerprints** según el formato especificado
4. **Terminar automáticamente** si se detecta un loop
5. **Reportar el loop** con el formato obligatorio
6. **No evadir la regla** con cambios triviales

## El agente orquestador (@build) debe:

1. **Monitorear** las ejecuciones de subagentes
2. **Verificar** que reportan loops cuando ocurran
3. **Intervenir** si un subagent persiste en un loop
4. **Escalar** al usuario si un loop no puede ser resuelto automáticamente

---

# CRITERIOS DE ÉXITO

Una implementación exitosa del anti-loop-protocol requiere:

1. ✅ La skill existe y define claramente la regla de 2 repeticiones
2. ✅ El formato de fingerprint es específico y no ambiguo
3. ✅ Todos los agentes pueden identificar "mismo procedimiento" y "mismo resultado"
4. ✅ Los agentes generan fingerprints consistentes
5. ✅ Los agentes terminan automáticamente al detectar loops
6. ✅ Los agentes no evaden la regla con cambios triviales
7. ✅ Los reportes de loops son claros y accionables
```