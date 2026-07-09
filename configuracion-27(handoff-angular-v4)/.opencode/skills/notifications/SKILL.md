---
name: notifications
description: Protocolo de notificaciones a Slack para el orquestador. Define formatos estandarizados para avisos de completado, solicitudes de permiso, consultas al usuario y errores críticos. Cárgala SIEMPRE que vayas a enviar un mensaje a Slack.
---

# Notifications Protocol — Formato de Avisos a Slack

## Objetivo
Estandarizar todos los mensajes enviados a Slack desde el orquestador para que sean visualmente distinguibles según su tipo.

## Canal
Todos los mensajes se envían a: **#opencode-agents**

## Tool
Usa SIEMPRE la herramienta `slack_send_slack_message` para enviar.

---

## 1. ✅ NOTIFICACIÓN DE COMPLETADO (Tarea finalizada)

**Cuándo usarla:** Después de que TODAS las fases (verificación post-implementación, QA, E2E) se hayan completado exitosamente.

**Formato:**
```
✅ [nombre-proyecto] — [título descriptivo]

📋 **Prompt original:**
"[texto del prompt del usuario]"

🔧 **Resumen de cambios:**
• [archivo 1] — [cambio 1]
• [archivo 2] — [cambio 2]
...

📊 **Validaciones:**
| Fase | Resultado |
|------|-----------|
| 🔍 Post-implementación | ✅ |
| 🛠️ Build | ✅ |
| 🧪 Tests | ✅ |
| 🎭 E2E | ✅ |
```

**Ejemplo:**
```
✅ Dino Runner — Bugs de colisión y salto corregidos

📋 **Prompt original:**
"El dinosaurio corre por debajo del piso y nunca colisiona"

🔧 **Resumen de cambios:**
• game.service.ts — checkCollision: < cambiado por <=
• app.component.ts — listener consolidado con ArrowUp
• game-canvas.component.ts — listener duplicado eliminado

📊 **Validaciones:**
| Fase | Resultado |
|------|-----------|
| 🔍 Post-implementación | ✅ |
| 🛠️ Build | ✅ |
| 🧪 Tests | ✅ |
| 🎭 E2E | ✅ |
```

---

## 2. ⚠️ SOLICITUD DE PERMISO (Requiere acción del usuario)

**Cuándo usarla:** Cuando el orquestador o un subagente necesita un permiso del usuario para continuar (ej: instalar un paquete, acceder a un recurso externo, modificar configuración del sistema).

**Formato:**
```
⚠️ PERMISO REQUERIDO — [título breve]

┌────────────────────────────────────────────┐
│           🔐 SOLICITUD DE PERMISO          │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: [nombre del agente]           │
│                                            │
│  📝 Acción solicitada:                     │
│  [descripción clara de lo que se necesita] │
│                                            │
│  ❓ Motivo:                                │
│  [por qué es necesario]                    │
│                                            │
│  ⚡ Alternativa si se deniega:             │
│  [qué pasa si no se concede]              │
│                                            │
└────────────────────────────────────────────┘

👉 Responde en el chat para: [acción esperada del usuario]
```

**Ejemplo:**
```
⚠️ PERMISO REQUERIDO — Instalar paquete npm

┌────────────────────────────────────────────┐
│           🔐 SOLICITUD DE PERMISO          │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: package-manager                │
│                                            │
│  📝 Acción solicitada:                     │
│  Ejecutar: npm install three@0.160.0       │
│                                            │
│  ❓ Motivo:                                 │
│  Necesario para añadir gráficos 3D         │
│                                            │
│  ⚡ Alternativa si se deniega:             │
│  Se usará Canvas 2D como fallback          │
│                                            │
└────────────────────────────────────────────┘

👉 Responde en el chat para: confirmar o denegar la instalación
```

---

## 3. 🚨 ERROR CRÍTICO (Algo salió mal)

**Cuándo usarla:** Cuando una validación falla tras agotar iteraciones, o cuando ocurre un error inesperado que impide continuar.

**Formato:**
```
🚨 ERROR — [título del error]

┌────────────────────────────────────────────┐
│              🚨 ERROR CRÍTICO              │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: [nombre del agente]           │
│                                            │
│  📍 Fase: [fase donde ocurrió]            │
│                                            │
│  📄 Descripción:                           │
│  [qué salió mal]                           │
│                                            │
│  🔍 Log relevante:                         │
│  [mensaje de error clave]                  │
│                                            │
│  💡 Acción sugerida:                       │
│  [qué debería hacer el usuario]            │
│                                            │
└────────────────────────────────────────────┘
```

**Ejemplo:**
```
🚨 ERROR — Build falla en game.service.ts

┌────────────────────────────────────────────┐
│              🚨 ERROR CRÍTICO              │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: qa-validator                   │
│                                            │
│  📍 Fase: npm run build (3ra iteración)   │
│                                            │
│  📄 Descripción:                           │
│  Error de tipo: Property 'clouds' does not │
│  exist on type 'GameService'               │
│                                            │
│  🔍 Log relevante:                         │
│  src/app/.../game-canvas.component.ts:23   │
│                                            │
│  💡 Acción sugerida:                       │
│  Verificar que GameService.clouds exista   │
│                                            │
└────────────────────────────────────────────┘
```

---

## 4. ❓ CONSULTA AL USUARIO (Agente pregunta algo)

**Cuándo usarla:** Cuando un agente ejecuta la herramienta `question` para preguntar algo al usuario con opciones, pausando el flujo hasta recibir respuesta. También aplica cuando se necesita aclarar un requisito o decidir una dirección técnica. El agente DEBE enviar esta notificación a Slack AL MISMO TIEMPO que ejecuta la herramienta `question`, para dejar constancia de la consulta.

**Formato:**
```
❓ CONSULTA — [título breve]

┌────────────────────────────────────────────┐
│           ❓ CONSULTA AL USUARIO            │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: [nombre del agente]           │
│                                            │
│  📝 Pregunta:                              │
│  [texto de la pregunta]                    │
│                                            │
│  🎯 Contexto:                              │
│  [por qué se necesita esta información]    │
│                                            │
│  💡 Opciones:                              │
│  • [Opción 1] — [descripción breve]        │
│  • [Opción 2] — [descripción breve]        │
│  • [Opción 3] — [descripción breve]        │
│                                            │
└────────────────────────────────────────────┘

👉 Responde en el chat para: [lo que el usuario debe hacer]
```

**Ejemplo:**
```
❓ CONSULTA — Framework CSS para el proyecto

┌────────────────────────────────────────────┐
│           ❓ CONSULTA AL USUARIO            │
├────────────────────────────────────────────┤
│                                            │
│  🤖 Agente: code-writer                    │
│                                            │
│  📝 Pregunta:                              │
│  ¿Qué framework CSS prefieres para el      │
│  diseño de la pantalla de bienvenida?      │
│                                            │
│  🎯 Contexto:                              │
│  Necesito definir los estilos antes de     │
│  implementar el componente.                │
│                                            │
│  💡 Opciones:                              │
│  • Tailwind CSS — Utilidades primero       │
│  • Bootstrap — Componentes predefinidos    │
│  • CSS Modules — Estilos encapsulados      │
│                                            │
└────────────────────────────────────────────┘

👉 Responde en el chat para: elegir una opción
```

---

## Reglas de uso

1. **Completado**: Solo al final exitoso de TODAS las fases
2. **Permiso**: Antes de ejecutar acciones que requieran aprobación humana (instalar paquetes, modificar config, acceder a recursos externos)
3. **Consulta**: Cuando un agente necesita preguntar algo al usuario para continuar
4. **Error**: Cuando se agoten las iteraciones de una fase sin resolución
5. **No mezclar**: Cada mensaje debe ser de un SOLO tipo
6. **Tool obligatoria**: Usa SIEMPRE `slack_send_slack_message` — no simules ni devuelvas texto plano
