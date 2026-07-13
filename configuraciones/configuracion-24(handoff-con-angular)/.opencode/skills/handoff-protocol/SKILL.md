---
name: handoff-protocol
description: Sistema de delegación entre agentes mediante archivos JSON en /tmp/handoff/. build gestiona todos los handoffs y pasa la ruta exacta a cada agente.
---

# Handoff Protocol — Sistema de delegación entre agentes

## Principio fundamental

**build usa task() directo por defecto. Handoff solo cuando el contenido a transferir ya fue generado por otro agente.**

Esto minimiza tokens de build (modelo API online) y mueve el costo de escritura/lectura a los modelos locales (Ollama).

## Regla de decisión

| build origina la tarea | → task() directo con instrucciones inline |
|---|---|
| Subagente A produce output para subagente B | → A escribe handoff, build pasa solo la ruta a B |

## Gestión de handoffs

El orquestador (build) gestiona todos los handoffs. Los agentes NO buscan ni asignan handoffs automáticamente. build indica la ruta exacta a cada agente.

## ⚠️ Generación de session_id con timestamp real (OBLIGATORIO)

build DEBE generar timestamps reales, NO hardcodear `000000`. Para ello, build necesita permiso bash para ejecutar:

```bash
node -e "const d=new Date();const pad=n=>String(n).padStart(2,'0');console.log(pad(d.getDate())+'-'+pad(d.getMonth()+1)+'-'+String(d.getFullYear()).slice(2)+'-'+pad(d.getHours())+pad(d.getMinutes())+pad(d.getSeconds()))"
```

El output (ej: `09-06-26-143000`) se usa como `session_id`. Para carpetas de agente (code-writer143000, verifier143000), se extrae `HHMMSS` del mismo timestamp.

**Configuración necesaria en `opencode-v1.json`** para build:
```json
"bash": {
  "*": "deny",
  "node -e *console.log(Date.now())*": "allow",
  "node -e *new Date()*": "allow",
  "node -e *pad(Date*": "allow"
}
```

## Estructura de directorios

```
/tmp/handoff/{idSession}/
  ├── (raíz, build delega a code-writer para crearla)
   ├── {agente_destino}{HHMMSS}/
   │   └── tarea1.json
   │   └── tarea2.json
   └── {agente_destino}{HHMMSS}/
       └── tarea1.json
```

| Variable | Descripción |
|---|---|
| `{idSession}` | ID único `DD-MM-AA-HHMMSS`. Lo genera build. Conocido por todos los agentes de la sesión. |
| `{agente_destino}` | Agente que ejecutará la tarea (code-writer, verifier, qa-validator, ui-designer). |
| `{HHMMSS}` | Timestamp de creación SIN separadores (formato 24h: 143000 = 14:30:00). build lo usa para generar nombres de carpeta únicos y ordenar asignaciones. ⚠️ SIN colones (:) para compatibilidad cross-platform (Windows/macOS/Linux). |
| `tareaN.json` | Archivo JSON con especificación de una **tarea nuclear** (unidad atómica ejecutable). |

## Formato del archivo `tareaN.json`

```json
{
  "tipo": "spec-ui | plan-logica | verificacion | test | correccion",
  "origen": "ui-designer | decomposer | code-writer | verifier | qa-validator",
  "destino": "code-writer | verifier | qa-validator",
  "session_id": "DD-MM-AA-HHMMSS",
  "timestamp": "HHMMSS",
  "contenido": { ... }
}
```

El campo `tipo` permite al agente destino actuar según el contenido:
- `spec-ui` → viene de ui-designer, implementar UI
- `plan-logica` → viene de decomposer, implementar lógica
- `verificacion` → viene de code-writer, verificar archivos
- `test` → viene de verifier, ejecutar build y tests
- `correccion` → viene de verifier o qa-validator, corregir error específico

## Flujo

### 1. Creación del directorio raíz

build genera `{idSession}` y delega a **code-writer** la creación de `/tmp/handoff/{idSession}/`:

```
build → task(code-writer, "Crea /tmp/handoff/{idSession}/")
```

code-writer ejecuta `mkdir -p /tmp/handoff/{idSession}/`.

### 2. Asignación de tareas por build

**build usa `task()` directo por defecto** (sin handoff). Handoff solo cuando un subagente ya escribió el archivo JSON para otro subagente:

- build → task(code-writer, "Crea [archivos]") → 🚫 sin handoff
- build → task(ui-designer, "Diseña [pantalla]") → ui-designer escribe handoff → build → task(code-writer, "Lee handoff en [ruta]") → ✅ handoff

build decide qué agente ejecuta y, si hay handoff, le pasa la ruta exacta.

### 3. Lectura

El agente recibe de build la ruta exacta al archivo JSON. No busca ni descubre rutas.

### 4. Escritura

El agente productor escribe en la carpeta del **agente destino** (NO en la propia):

| Agente productor | Escribe en | Contenido de tareaN.json |
|---|---|---|
| ui-designer | `/tmp/handoff/{idSession}/code-writer{HHMMSS}/tareaN.json` | `tipo: "spec-ui"` → template, styles, typescript (estructural) |
| code-writer | `/tmp/handoff/{idSession}/verifier{HHMMSS}/tareaN.json` | `tipo: "verificacion"` → archivos creados/modificados |
| verifier | `/tmp/handoff/{idSession}/qa-validator{HHMMSS}/tareaN.json` | `tipo: "test"` → archivos verificados + resultado |
| verifier | `/tmp/handoff/{idSession}/code-writer{HHMMSS}/tareaN.json` | `tipo: "correccion"` → error a corregir (si error-routing lo decide) |
| qa-validator | `/tmp/handoff/{idSession}/code-writer{HHMMSS}/tareaN.json` | `tipo: "correccion"` → error a corregir (si error-routing lo decide) |

### 5. Reglas obligatorias

1. **build** NUNCA escribe archivos ni handoffs. Delega la creación de directorio raíz a code-writer.
2. **build** NUNCA genera un handoff por sí mismo. Si la tarea la origina build, usa task() directo.
3. **build** NUNCA lee el contenido de archivos handoff JSON. La ruta es un string opaco. build solo extrae el nombre de la carpeta destino para saber a quién delegar.
4. **build** pasa la ruta **completa y exacta** a cada agente. El agente no descubre rutas.
5. **Cada agente** escribe solo en la carpeta del agente destino con timestamp actual.
6. **Ningún agente** escribe en su propia carpeta de asignación.
7. **Formato JSON siempre.** El campo `tipo` diferencia spec-ui, plan-logica, verificacion, test, correccion.
8. **Máximo 2 reintentos** por agente. Si falla 2 veces, escalar al usuario.
