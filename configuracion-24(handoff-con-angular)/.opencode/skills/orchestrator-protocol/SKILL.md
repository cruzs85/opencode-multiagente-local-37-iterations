---
name: orchestrator-protocol
description: Protocolo para que el orquestador lea el prompt del subagente antes de dar instrucciones, evitando órdenes contradictorias. Úsala cuando vayas a delegar una tarea a code-writer, qa-validator, package-manager, unit-tester o cualquier subagente.
---
# Orchestrator Protocol — Anti-contradicción
## Objetivo
Evitar que el orquestador dé instrucciones a un subagente que contradigan las herramientas, métodos y reglas que ese subagente tiene configuradas en su prompt interno.
## Regla de oro
**No le exijas a un subagente usar herramientas distintas a las que su prompt le ordena.**
## Procedimiento obligatorio
Antes de enviar cualquier instrucción a un subagente, el orquestador DEBE:
### Paso 1: Leer el prompt del subagente destino (delegado a @explorer)
NO uses tu herramienta `read` directamente. En su lugar, delega a @explorer con:
  "Explorer, ejecuta EXACTAMENTE: node -e \"const p=JSON.parse(require('fs').readFileSync('opencode.json','utf8'));console.log(p.agent.NOMBRE.prompt)\""
Esto te devolverá el prompt completo para conocer:
- Qué herramientas tiene permitidas (`edit`, `bash`, etc.)
- Qué métodos de trabajo prefiere (ej: `bash + cat` para archivos completos vs `edit` para cambios parciales)
- Qué comandos específicos puede ejecutar (ej: `npm run build*` pero no otros)
### Paso 2: Alinear las instrucciones
Asegurarse de que las instrucciones que se van a dar usan EXACTAMENTE las herramientas y métodos que el subagente tiene configurados.
### Paso 3: No forzar herramientas no autorizadas
Si el subagente tiene `edit: deny` (como qa-validator), no se le debe pedir que edite archivos. Si solo tiene permitido `npm run build*` y `npm test*`, no se le debe pedir que ejecute otros comandos.
### Paso 4: NO incluir contenido del handoff en el prompt (OBLIGATORIO)

#### 🛑 Regla absoluta
Si estás delegando a un subagente que va a LEER un handoff JSON, tu prompt DEBE ser EXACTAMENTE:
```
Lee el handoff en [ruta exacta] y ejecuta tu protocolo
```
**NADA MÁS.** No listas de archivos. No verificaciones. No resúmenes. No contexto.

#### ⚠️ Por qué es crítica
Si incluyes contenido inline, el subagente lo procesará en lugar del JSON, o lo procesará dos veces (una por tu prompt y otra por el JSON), causando resultados inconsistentes o ignorando el handoff por completo.

#### 🔍 Auto-check obligatorio (LEER EN VOZ ALTA)
ANTES de presionar Enter con `task()`, build DEBE:
1. Leer el prompt EN VOZ ALTA (mentalmente pero letra por letra)
2. Verificar que NO contiene:
   - ❌ Ninguna ruta de archivo de `src/`
   - ❌ Ningún nombre de método o propiedad del contenido del handoff
   - ❌ Ninguna lista de verificaciones
   - ❌ Ningún resumen de lo que hace el handoff
   - ✅ Solo la ruta al archivo JSON
3. Si el prompt tiene MÁS DE 1 LÍNEA (además de la ruta): ⚠️ RIESGO. Reescribir.

#### 🛡️ Defensa en el subagente (redudancia)
Los subagentes (code-writer, verifier, qa-validator) tienen instrucciones de IGNORAR
cualquier instrucción inline si reciben una ruta de handoff. build NO debe confiar en
esto, pero la redudancia existe para casos de fallo.

#### Ejemplo visual
```
❌ INCORRECTO:
  task(code-writer, "Lee el handoff en /tmp/handoff/X/code-writerY/tarea1.json.
  Los archivos a verificar son: game.service.ts, score.service.ts...")

✅ CORRECTO:
  task(code-writer, "Lee el handoff en /tmp/handoff/X/code-writerY/tarea1.json
  y ejecuta tu protocolo")
```

### 🚫 build NUNCA lee el contenido del handoff (NUEVO)

**La ruta del handoff es un string opaco para build.** build no debe usar `read`, `grep`, ni ninguna herramienta para inspeccionar el contenido del archivo JSON.

- La respuesta del subagente anterior (`"✅ Handoff en [ruta]"`) es suficiente
- build solo necesita extraer de la ruta el **nombre de la carpeta destino** para saber a quién delegar
- El contenido lo lee exclusivamente el subagente destino
- build = ruteador. No valida, no resume, no inspecciona.

#### Flujo correcto:
```
A responde: "✅ completado. Handoff en /tmp/handoff/X/verifierY/tarea1.json"
build extrae: carpeta = "verifier" (de "/tmp/handoff/X/verifierY/")
build ejecuta: task(verifier, "Lee el handoff en /tmp/handoff/X/verifierY/tarea1.json y ejecuta tu protocolo")
build NO ejecuta: read("/tmp/handoff/X/verifierY/tarea1.json") ❌
```

#### Razón:
- build usa modelo API online (caro, pago por token). Leer JSON desperdicia tokens sin beneficio.
- El subagente local (gratis) ya va a leer el JSON completo. build leerlo antes es duplicación pura.
- build no toma decisiones basadas en el contenido. La decisión (a quién delegar) la da la estructura de carpetas.

## Casos concretos
| Subagente | Tiene configurado | Qué NO pedirle |
|---|---|---|
| `code-writer` | `bash + cat` para archivos completos, `edit` para cambios parciales | `edit` para archivos completos (debe usar `cat`) |
| `qa-validator` | Solo `npm run build*`, `npm test*`, `npm run lint*` | Que ejecute `npx`, `ls`, `cat`, `git` |
| `package-manager` | `npm install*`, `ng *`, `npx *`, `edit`, `bash` | Que ejecute comandos no listados |
| `e2e-validator` | Solo `npx playwright test*` | Que ejecute builds o instale paquetes |
| `unit-tester` | `edit` solo para `*.spec.ts`, bash solo `npm test*`, `npx jest*` | Que modifique archivos de implementación |
| `decomposer` | Solo `skill.*` | Que ejecute bash, edite archivos o use task |
| `explorer` / `researcher` | Solo `skill.*` y `webfetch` (researcher) | Que ejecute bash o edite archivos |
## Verificación rápida
Antes de enviar una tarea, pregúntate:
1. ¿He leído el prompt de este subagente en `opencode.json`?
2. ¿Las herramientas que le estoy pidiendo usar coinciden con las que tiene permitidas?
3. ¿El método de trabajo (edit vs bash+cat) coincide con el que su prompt le ordena?
4. ¿Mi prompt contiene listas de archivos, verificaciones o contenido del handoff?
   → Si SÍ: REESCRÍBELO. Solo pasa la ruta del disco.
Si la respuesta a cualquiera es NO, ajusta las instrucciones antes de enviarlas.

## ⚠️ Límite de tamaño para heredocs (anti-bucle)
Cuando delegues a @code-writer, respeta estos límites para evitar que bash trunque el EOF del heredoc:

1. **Archivos de más de 50 líneas o 2000 caracteres**: NO uses bash heredoc (`cat > ruta << 'EOF'`).  
   En su lugar, usa `node -e` con `fs.writeFileSync()` leyendo desde un archivo temporal:
   ```
   cat > /tmp/contenido.txt << 'ENDOFFILE'
   [contenido del archivo]
   ENDOFFILE
   node -e "require('fs').writeFileSync('ruta', require('fs').readFileSync('/tmp/contenido.txt','utf8'),'utf8'); console.log('✅ escrito')"
   ```
2. **Archivos de 50 líneas o menos**: Puedes usar bash heredoc normal (`cat > ruta << 'EOF'`).
3. **Si el heredoc produce un warning** como "documento-aquí...esperaba EOF": el archivo se escribió correctamente. No reinicies la tarea ni recargues skills.
4. **Divide archivos muy grandes** (>100 líneas) en múltiples delegaciones separadas, cada una con máximo 4 toolcalls.

5. **NUNCA delegues ediciones de archivos a @explorer**: Explorer solo lee y ejecuta comandos de diagnóstico.
   Las ediciones de archivos (.ts, .html, .scss, .md, .json) deben ir SIEMPRE a @code-writer.

## Paso 6: Post-package-manager scaffolding verification (OBLIGATORIO)

Después de que package-manager complete scaffolding o instalación de dependencias:

1. Delegar a @explorer: `"ls -R src/app/ para verificar estructura del proyecto"`
2. Leer output y verificar:
   - NO existe `src/app/app/` (legacy anidado)
   - NO existe `src/app/app.ts` (legacy plano)
   - `src/main.ts` importa `AppComponent`, no un componente legacy
3. Si hay archivos legacy:
   - Delegar a @code-writer: `"Eliminar [ruta legacy] con rm -rf"`
   - Re-verificar después de la limpieza
4. Aplicar tanto en scaffolding inicial como en migraciones o refactors grandes

## ⚠️ Verificación post-code-writer (OBLIGATORIO)

Después de que code-writer responda "✅ Archivo [ruta] escrito.", el orquestador DEBE:

1. **Verificar el contenido**: Usar la herramienta `read` para leer el archivo destino y confirmar que el contenido NO es el template original/placeholder de Angular
2. **No confiar en "✅" ciegamente**: code-writer puede reportar éxito sin haber escrito realmente. Verificar con `read` es la única forma de confirmar
3. **Si el contenido no es el esperado** (ej: sigue siendo el template de Angular por defecto): Re-delegar a code-writer especificando explícitamente el método `node -e fs.writeFileSync` en lugar de bash heredoc
4. **Para archivos críticos** (AppComponent, servicios core, componentes principales): En la delegación inicial, especificar SIEMPRE "Usa node -e fs.writeFileSync con archivo temporal en /tmp/"
5. **Post-verification**: Después de confirmar que los archivos se escribieron correctamente, DELEGAR a @verifier para validación de contratos (OBLIGATORIO, no saltar)

⚠️ NO confiar en "✅" sin verificación.
⚠️ NO saltar la verificación post-implementation con @verifier.
⚠️ Si code-writer produce un output inesperado o vacío, reiniciar su contexto y re-delegar.