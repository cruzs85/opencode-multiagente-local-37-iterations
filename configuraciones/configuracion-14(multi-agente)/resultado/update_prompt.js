const fs = require('fs');
const ruta = 'opencode.json';
const doc = JSON.parse(fs.readFileSync(ruta, 'utf8'));

const promptActual = doc.agent.build.prompt;

// Construir el nuevo bloque
const bloqueBug = `PROTOCOLO DE INVESTIGACIÓN DE BUGS (ahorro de tokens):
  Cuando el usuario reporte un comportamiento incorrecto en la app:
  Paso 1 → Clasificar el bug por alcance:
    🔹 Bug ACOTADO (sospecha clara de 1 archivo, síntoma específico):
       → Leo el archivo sospechoso DIRECTAMENTE y resuelvo.
    🔹 Bug DIFUSO (no sé dónde está, involucra múltiples archivos,
       flujo de datos entre servicio y componente, o lógica distribuida):
       → DELEGO a @explorer la investigación.
  Paso 2 → Al delegar a @explorer para investigación de bugs:
    Le proporciono: síntoma observable, archivos que crea relevantes,
    hipótesis inicial. Él me devuelve: archivo exacto, línea,
    valor actual vs esperado, y causa raíz.
  Paso 3 → Yo analizo su reporte, diseño la solución y delego
    la corrección a @code-writer.

`;

// Insertar el bloque después de 'Usa @explorer para conocer el codebase antes de planificar.'
const searchStr = 'Usa @explorer para conocer el codebase antes de planificar.';
const idx = promptActual.indexOf(searchStr);
if (idx !== -1) {
  const before = promptActual.substring(0, idx + searchStr.length);
  const after = promptActual.substring(idx + searchStr.length);
  doc.agent.build.prompt = before + '\n\n' + bloqueBug + after;
}

fs.writeFileSync(ruta, JSON.stringify(doc, null, 2) + '\n');
console.log('✅ opencode.json actualizado correctamente');
