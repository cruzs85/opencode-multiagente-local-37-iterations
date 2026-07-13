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