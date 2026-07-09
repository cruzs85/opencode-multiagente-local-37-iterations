---
name: delegation-protocol
description: Protocolo para que el orquestador delegue tareas a code-writer con separación explícita entre contenido del archivo e instrucciones de ejecución. Cárgala SIEMPRE que vayas a enviar una tarea a code-writer.
---

# Delegation Protocol — Instrucciones claras para code-writer

## Objetivo
Estructurar las tareas que el orquestador delega a code-writer
para evitar que code-writer confunda contenido del archivo con instrucciones de ejecución.

## Regla de oro
** Separa siempre qué escribir de cómo ejecutarlo.**

## Formato obligatorio

Usa estos marcadores para delimitar cada sección:

### Para creación de archivos nuevos

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

### Para modificación de archivos existentes (code .ts, .html, .scss)

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

### Para modificar JSON (especialmente opencode.json)

** NO uses `=== CONTENIDO DEL ARCHIVO ===`.** Las modificaciones de propiedades JSON no escriben un archivo completo, solo cambian una propiedad. Usa solo `=== INSTRUCCIONES ===` con el comando exacto.

En lugar de incluir el valor largo en el comando (riesgo de colisión de comillas entre bash y JavaScript), escribe el valor en un archivo temporal primero:

**Paso 1 — Preparar el valor:**

```
=== INSTRUCCIONES (paso 1) ===
[Método: bash heredoc]
[Escribe el nuevo valor del prompt en /tmp/nuevo_valor.txt:]
cat > /tmp/nuevo_valor.txt << 'EOF'
Aquí el texto del prompt con "comillas" y 'simples'
EOF
[Carga json-safe-edit antes de continuar]
```

**Paso 2 — Aplicar la modificación:**

```
=== INSTRUCCIONES (paso 2) ===
[Método: node -e programático leyendo desde /tmp/]
[Comando:]
node -e "
const fs = require('fs');
const ruta = 'opencode.json';
const nuevoValor = fs.readFileSync('/tmp/nuevo_valor.txt', 'utf8');
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
doc.agent.X.prompt = nuevoValor;
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ JSON actualizado');
"
[Validar JSON post-edición]
```

## Reglas para el orquestador


1. **Siempre** usa `=== CONTENIDO DEL ARCHIVO ===` para delimitar el texto que code-writer debe escribir en el archivo.
2. **Siempre** usa `=== INSTRUCCIONES ===` para delimitar los pasos que code-writer debe ejecutar.
3. No mezcles ambos en una misma sección sin marcadores.
4. **NO uses `=== CONTENIDO DEL ARCHIVO ===` para modificar propiedades dentro de un JSON existente.** No estás creando un archivo, estás cambiando una propiedad. Usa solo `=== INSTRUCCIONES ===`.
5. Si el contenido es muy largo (como un prompt), escríbelo primero a `/tmp/` con cat heredoc, luego reférencialo desde node -e.
6. Si solo envías instrucciones sin contenido de archivo (ej: "corrige este error"), no necesitas los marcadores. Solo sé explícito.

## Anti-patrones

| ❌ Incorrecto | ✅ Correcto |
|---|---|
| Poner el contenido y las instrucciones en el mismo párrafo | Separar con === CONTENIDO === y === INSTRUCCIONES === |
| Terminar la tarea con "Instrucciones:" sin marcador | Usar === INSTRUCCIONES === con el marcador completo |
| "El nuevo prompt debe ser:" seguido de pasos para code-writer | Poner el prompt bajo === CONTENIDO DEL ARCHIVO === y los pasos bajo === INSTRUCCIONES === |
| Asumir que code-writer infiere qué va dentro del archivo | Delimitar explícitamente cada sección |
| Usar === CONTENIDO DEL ARCHIVO === para modificar una propiedad JSON | Usar solo === INSTRUCCIONES === con archivo temporal en /tmp/ |
| Poner el prompt largo con comillas dentro del comando node -e | Escribir a /tmp/ primero, leer desde node -e |

## Checklist para el orquestador

Antes de enviar la tarea a code-writer, verifica:

- [ ] ¿Usé el marcador correcto según el tipo de operación?
- [ ] Para archivos nuevos: `=== CONTENIDO DEL ARCHIVO ===`
- [ ] Para modificar código existente: `=== FRAGMENTO A CAMBIAR ===`
- [ ] Para modificar JSON: NUNCA `=== CONTENIDO DEL ARCHIVO ===`, solo `=== INSTRUCCIONES ===`
- [ ] ¿Incluí la ruta absoluta del archivo?
- [ ] ¿Indiqué el método (bash heredoc / edit / node -e)?
- [ ] Si es JSON: ¿voy a escribir el valor a /tmp/ primero para evitar colisión de comillas?
- [ ] Si el archivo depende de otros: el orquestador debe asegurar que @verifier cargue contract-verification post-escritura
