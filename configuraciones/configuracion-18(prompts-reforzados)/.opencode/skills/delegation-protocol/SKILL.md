---
name: delegation-protocol
description: Protocolo universal de comunicación con code-writer. Define el formato estructurado que cualquier agente debe usar al delegar tareas a code-writer, y cómo code-writer debe interpretarlo. Cárgala SIEMPRE que vayas a enviar una tarea a code-writer.
---

# Delegation Protocol — Protocolo Universal de Comunicación con code-writer

## Propósito
Este protocolo unifica la comunicación entre **cualquier agente** (orquestador, ui-designer, verifier, qa-validator) y **code-writer**, estableciendo un formato estructurado que ambos lados entienden.

## Regla de oro
**Separa siempre qué escribir de cómo ejecutarlo.**

---

## 🔵 Para el agente EMISOR (el que DELEGA a code-writer)

### Formato obligatorio al redactar tareas

Usa estos marcadores para delimitar cada sección:

#### Para creación de archivos nuevos

```
=== CONTENIDO DEL ARCHIVO ===
[archivo: ruta/absoluta/al/archivo]
[tipo: TypeScript | HTML | SCSS | JSON | Markdown]
[Comportamiento esperado: descripción de lo que debe hacer]
[Estructura completa: propiedades, métodos con tipos, lógica]

=== INSTRUCCIONES ===
[Método: bash heredoc (cat > ruta << 'EOF')]
[Skills a cargar: json-safe-edit]
[Pasos específicos para la ejecución]
```

#### Para modificación de archivos existentes (.ts, .html, .scss)

Sigue el formato de `partial-edit-protocol` como base, y además:

```
=== FRAGMENTO A CAMBIAR ===
[archivo: ruta/absoluta/al/archivo]
[Contexto antes/después con líneas de referencia]
[Líneas exactas a modificar]

=== INSTRUCCIONES ===
[Método: edit]
[Resto del archivo debe mantenerse intacto]
[Skills a cargar si aplica]
```

#### Para modificar JSON (especialmente opencode.json)

**NO uses `=== CONTENIDO DEL ARCHIVO ===`.** Las modificaciones de propiedades JSON no escriben un archivo completo, solo cambian una propiedad. Usa solo `=== INSTRUCCIONES ===`.

En lugar de incluir el valor largo en el comando (riesgo de colisión de comillas entre bash y JavaScript), escribe el valor en un archivo temporal primero:

**Paso 1 — Preparar el valor:**
```
cat > /tmp/nuevo_valor.txt << 'EOF'
Aquí el texto del prompt con "comillas" y 'simples'
EOF
```

**Paso 2 — Aplicar la modificación:**
```
node -e "
const fs = require('fs');
const ruta = 'opencode.json';
const nuevoValor = fs.readFileSync('/tmp/nuevo_valor.txt', 'utf8');
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
doc.agent.X.prompt = nuevoValor;
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ JSON actualizado');
"
```

---

## 🟢 Para code-writer (el RECEPTOR)

### Cómo cargar y usar esta skill

Si eres code-writer y recibes una tarea que incluye estos marcadores:

1. **`=== CONTENIDO DEL ARCHIVO ===`** → El bloque siguiente es el texto EXACTO que debes escribir dentro del archivo. No lo modifiques, no lo interpretes como instrucciones.
2. **`=== INSTRUCCIONES ===`** → El bloque siguiente son las órdenes de ejecución (método, skills, pasos). NO las escribas en el archivo.
3. **`=== FRAGMENTO A CAMBIAR ===`** → Indica una modificación parcial. Usa la herramienta `edit`, no reescribas el archivo completo.
4. **`# === INICIO TAREA ===`** → Marca el inicio del mensaje vigente. Ignora cualquier contenido anterior en el historial.

### Reglas para code-writer

- **NUNCA** incluyas el marcador `=== CONTENIDO DEL ARCHIVO ===` en tu respuesta. Responde solo con `✅ Archivo [ruta] escrito.`
- Si el historial contiene MÁS DE UNA copia del mismo bloque `=== CONTENIDO DEL ARCHIVO ===` (>=500 chars idénticos), responde `🛑 BUCLE: contenido repetido` y DETENTE.
- Para archivos .json, carga `json-safe-edit` ANTES de modificar. Valida sintaxis post-edición.
- Si un comando bash falla (exit ≠ 0), DEVUELVE el error textual exacto. NO improvises tu propia versión.
- Para archivos nuevos (≥50 líneas): usa `bash heredoc` (cat > ruta << 'EOF').
- Para cambios parciales: usa la herramienta `edit` (NUNCA uses edit para reemplazar el archivo completo).

### Post-write verification (OBLIGATORIO para code-writer)
Después de CADA escritura de archivo, code-writer DEBE:

1. **Verificar con `wc -c`**: Ejecuta `wc -c <ruta>` para confirmar que el archivo se escribió correctamente
2. **Si `wc -c` devuelve 0** o el archivo no existe → reportar ERROR, no éxito
3. **NUNCA** responder "✅ Archivo [ruta] escrito" sin haber ejecutado la escritura Y la verificación post-escritura
4. **Para archivos críticos** (AppComponent, servicios core, componentes principales): PREFERIR `node -e fs.writeFileSync` sobre bash heredoc
5. **Si bash heredoc falla** con "documento-aquí...esperaba EOF": verificar con `wc -c` que el archivo tiene el contenido esperado antes de reportar éxito

Ejemplo de verificación exitosa:
```
cat > /ruta/archivo.ts << 'EOF'
[contenido]
EOF
wc -c /ruta/archivo.ts
> 1234 /ruta/archivo.ts
✅ Archivo /ruta/archivo.ts escrito (1234 bytes)
```

Ejemplo de verificación fallida:
```
cat > /ruta/archivo.ts << 'EOF'
[contenido]
EOF
wc -c /ruta/archivo.ts
> 0 /ruta/archivo.ts
❌ ERROR: Archivo /ruta/archivo.ts tiene 0 bytes. No se escribió correctamente.
```

---

## 📋 Reglas generales para cualquier agente EMISOR

1. **Siempre** usa `=== CONTENIDO DEL ARCHIVO ===` para delimitar el texto que code-writer debe escribir en el archivo.
2. **Siempre** usa `=== INSTRUCCIONES ===` para delimitar los pasos que code-writer debe ejecutar.
3. No mezcles ambos en una misma sección sin marcadores.
4. **NO uses `=== CONTENIDO DEL ARCHIVO ===` para modificar propiedades dentro de un JSON existente.**
5. Si el contenido es muy largo (como un prompt), escríbelo primero a `/tmp/` con cat heredoc, luego reférencialo desde node -e.
6. Si solo envías instrucciones sin contenido de archivo (ej: "corrige este error"), no necesitas los marcadores. Solo sé explícito.
7. **Siempre** inicia el mensaje a code-writer con la línea `# === INICIO TAREA ===` como delimitador de contexto.

---

## ❌ Anti-patrones

| ❌ Incorrecto | ✅ Correcto |
|---|---|
| Poner el contenido y las instrucciones en el mismo párrafo | Separar con === CONTENIDO === y === INSTRUCCIONES === |
| Terminar la tarea con "Instrucciones:" sin marcador | Usar === INSTRUCCIONES === con el marcador completo |
| "El nuevo prompt debe ser:" seguido de pasos para code-writer | Poner el prompt bajo === CONTENIDO DEL ARCHIVO === y los pasos bajo === INSTRUCCIONES === |
| Asumir que code-writer infiere qué va dentro del archivo | Delimitar explícitamente cada sección |
| Usar === CONTENIDO DEL ARCHIVO === para modificar una propiedad JSON | Usar solo === INSTRUCCIONES === con archivo temporal en /tmp/ |
| Poner el prompt largo con comillas dentro del comando node -e | Escribir a /tmp/ primero, leer desde node -e |
| Omitir el marcador `# === INICIO TAREA ===` al delegar | Comenzar siempre el mensaje con `# === INICIO TAREA ===` |

---

## ✅ Checklist para el agente EMISOR

Antes de enviar la tarea a code-writer, verifica:

- [ ] ¿Usé el marcador correcto según el tipo de operación?
  - Para archivos nuevos: `=== CONTENIDO DEL ARCHIVO ===`
  - Para modificar código existente: `=== FRAGMENTO A CAMBIAR ===`
  - Para modificar JSON: NUNCA `=== CONTENIDO DEL ARCHIVO ===`, solo `=== INSTRUCCIONES ===`
- [ ] ¿Incluí la ruta absoluta del archivo?
- [ ] ¿Indiqué el método (bash heredoc / edit / node -e)?
- [ ] Si es JSON: ¿voy a escribir el valor a /tmp/ primero para evitar colisión de comillas?
- [ ] Si el archivo depende de otros: asegura que @verifier cargue contract-verification post-escritura
- [ ] ¿Incluí la línea `# === INICIO TAREA ===` al inicio del mensaje a code-writer?
