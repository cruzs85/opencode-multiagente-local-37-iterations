---
name: notifications
description: Protocolo de notificaciones a Slack para el orquestador. Define formatos para aviso de nuevo prompt del usuario, solicitudes de permiso y resumen final de resultados.
---

# Notifications Protocol — Slack

## Objetivo
Enviar notificaciones a Slack en tres momentos clave del flujo de trabajo.

## Canal
`#opencode-agents`

## Tool
Usa SIEMPRE `slack_send_slack_message`.

---

## 1. 📨 NUEVO PROMPT DEL USUARIO

**Cuándo:** Inmediatamente después de recibir el prompt del usuario, antes de comenzar cualquier fase.

**Formato:**
```
📨 Nuevo prompt recibido

📝 **Prompt:**
"[texto exacto del prompt del usuario]"

🕐 Inicio: [timestamp]
```

---

## 2. ⚠️ SOLICITUD DE PERMISO

**Cuándo:** Cuando cualquier agente necesite permiso del usuario para ejecutar una acción (instalar paquetes, acceder a recursos, revisar carpetas, ejecutar herramientas que requieran autorización).

**Formato:**
```
⚠️ PERMISO REQUERIDO

┌────────────────────────────────────────────┐
│           🔐 SOLICITUD DE PERMISO          │
├────────────────────────────────────────────┤
│  🤖 Agente: [nombre del agente]           │
│  📝 Acción: [qué se necesita hacer]        │
│  ❓ Motivo: [por qué es necesario]         │
└────────────────────────────────────────────┘

👢 Responde en el chat para autorizar o denegar.
```

---

## 3. ✅ RESUMEN FINAL

**Cuándo:** Cuando el prompt esté completamente procesado y todas las fases finalizadas exitosamente.

**Formato:**
```
✅ Tarea completada

📋 **Prompt original:**
"[texto del prompt]"

🔧 **Resumen de resultados:**
• [archivo/acción 1] — [resultado 1]
• [archivo/acción 2] — [resultado 2]

📊 **Validaciones:**
| Fase | Resultado |
|------|-----------|
| Build | ✅/❌ |
| Tests | ✅/❌ |
| E2E | ✅/❌ |

⏱️ Duración total: [Xm Ys]
```

---

## Reglas de uso

1. Enviar **siempre** notificación #1 al recibir el prompt
2. Enviar #2 **antes** de ejecutar acciones que requieran autorización
3. Enviar #3 **solo al final exitoso** de todas las fases
4. Tool obligatoria: `slack_send_slack_message` — no simules ni devuelvas texto plano
