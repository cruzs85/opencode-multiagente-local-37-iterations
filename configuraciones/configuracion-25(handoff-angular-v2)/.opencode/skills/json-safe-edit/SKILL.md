---
name: json-safe-edit
description: Protocolo para editar archivos JSON de forma segura. Imprescindible cuando se modifican prompts u otros valores string de línea única con caracteres escapados (\n). Cárgala SIEMPRE antes de editar cualquier archivo .json en el proyecto.
---

# JSON Safe Edit Protocol

## Objetivo
Evitar la corrupción de archivos JSON al editarlos, especialmente cuando contienen valores string largos de línea única (como prompts de agentes).

## Cuándo usarla
Siempre que vayas a modificar un archivo `.json` en el proyecto, especialmente:
- `opencode.json` — contiene prompts de línea única con `\n` escapados
- `package.json` — dependencias y scripts
- `angular.json` — configuración del proyecto Angular
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json` — configuración TypeScript

---

## Métodos de edición segura

### Método 1: `node -e` programático (RECOMENDADO para modificar valores específicos)
Usa `bash` con `node -e` para parsear, modificar y serializar el JSON. Así evitas problemas con caracteres escapados.

```bash
node -e "
const fs = require('fs');
const ruta = 'archivo.json';
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
// Modifica las propiedades necesarias
doc.agenteX.propiedad = 'nuevo valor con \\n saltos';
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ JSON actualizado correctamente');
"
```

**Ventajas**: No toca el formato del archivo, maneja escapes automáticamente, seguro.

### Método 2: `cat` heredoc (RECOMENDADO para reescribir archivos completos)
Cuando necesites reemplazar el contenido COMPLETO de un archivo JSON (ej: archivos pequeños o nueva creación):

```bash
cat > archivo.json << 'EOF'
{
  "clave": "valor con \\n saltos"
}
EOF
```

**Ventajas**: Control total del contenido, ideal para archivos nuevos o pequeños.

### Método 3: `edit` tool (SOLO para archivos con estructura multilínea y valores cortos)
Usa la herramienta `edit` ÚNICAMENTE cuando:
- El archivo JSON tiene estructura multilínea (pretty-printed)
- Los valores string son cortos (< 100 caracteres)
- No contienen caracteres escapados complejos

**⚠️ PROHIBIDO usar `edit` para:**
- Archivos JSON con valores string de línea única (como prompts con `\n`)
- Valores que contengan caracteres escapados
- Reemplazar contenido completo de un archivo JSON

### Método 4: Archivo temporal para valores string largos (RECOMENDADO para prompts con comillas)

Cuando el valor a asignar contiene comillas dobles, comillas simples, o es muy largo (>200 caracteres),
NO lo incluyas directamente en el comando node -e. En su lugar:

**Paso 1:** Escribe el valor en un archivo temporal:
```bash
cat > /tmp/nuevo_valor.txt << 'EOF'
Aquí va el texto del prompt con "comillas" y 'simples' sin problemas
EOF
```

**Paso 2:** Desde node -e, lee ese archivo:
```bash
node -e "
const fs = require('fs');
const ruta = 'opencode.json';
const nuevoValor = fs.readFileSync('/tmp/nuevo_valor.txt', 'utf8');
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
doc.agent.X.prompt = nuevoValor;
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ JSON actualizado correctamente');
"
```

**Ventajas**: Elimina por completo el riesgo de colisión de comillas entre bash y JavaScript.

---

## ⚠️ Regla anti-anidamiento de comillas

NUNCA pongas un prompt largo (con comillas dobles, simples y \\n escapados) directamente dentro del comando node -e entre comillas dobles de bash. Bash interpreta \" como literales, rompiendo el string de JavaScript.

**Siempre usa el Método 4 (archivo temporal) para valores que contengan:**
- Comillas dobles o simples
- Más de 200 caracteres
- Caracteres de escape como \\n

---

## Validación obligatoria post-edición

Después de CUALQUIER modificación a un archivo `.json`, DEBES validar la sintaxis:

```bash
node -e "JSON.parse(require('fs').readFileSync('ARCHIVO.json','utf8'))" && echo '✅ JSON válido'
```

Si la validación falla:
1. NO CONTINÚES con la tarea
2. Lee el archivo para identificar el error
3. Corrige usando el Método 1, 2 o 4
4. Re-valida
5. Máximo 2 iteraciones. Si persiste, escala al orquestador.

---

## Ejemplos de casos reales

### Ejemplo 1: Modificar un prompt en opencode.json (usar Método 4)
```bash
# Paso 1: escribir el nuevo prompt en archivo temporal
cat > /tmp/nuevo_prompt.txt << 'EOF'
Eres el agente orquestador.

Nuevo bloque de instrucciones...

Fin.
EOF

# Paso 2: aplicar la modificación
node -e "
const fs = require('fs');
const ruta = 'opencode.json';
const nuevoValor = fs.readFileSync('/tmp/nuevo_prompt.txt', 'utf8');
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
doc.agent.build.prompt = nuevoValor;
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ Prompt actualizado');
"
```

### Ejemplo 2: Añadir una dependencia en package.json (usar Método 1)
```bash
node -e "
const fs = require('fs');
const ruta = 'package.json';
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));
doc.dependencies['nuevo-paquete'] = '^1.0.0';
fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
"
```

### Ejemplo 3: Crear un archivo JSON nuevo (usar Método 2)
```bash
cat > nueva-config.json << 'EOF'
{
  "version": 1,
  "nombre": "Configuración de prueba"
}
EOF
```

---

## Checklist de seguridad

- [ ] ¿Cargaste la skill `json-safe-edit` antes de empezar?
- [ ] ¿Identificaste si el JSON tiene valores string de línea única?
- [ ] Para valores largos con comillas: ¿usaste Método 4 (archivo temporal)?
- [ ] ¿Validaste el JSON después de editar?
- [ ] Si usaste `edit`, ¿verificaste que el archivo sigue siendo JSON válido?