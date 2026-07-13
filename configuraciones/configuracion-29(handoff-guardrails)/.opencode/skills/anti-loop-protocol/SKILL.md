---
name: anti-loop-protocol
description: Protocolo de detección de bucles infinitos para agentes
---

# Protocolo de Detección de Bucles

## Objetivo
Este protocolo garantiza que los agentes no caigan en bucles infinitos durante la ejecución de tareas, asegurando la eficiencia y estabilidad del sistema.

## Reglas Generales
1. **Monitoreo continuo**: Cada agente debe verificar que sus acciones estén avanzando hacia un objetivo definido
2. **Reinicio automático**: Si se detecta un bucle, reiniciar el contexto del agente
3. **Límites de ejecución**: Establecer límites máximos de intentos para tareas repetitivas
4. **Registro de actividad**: Mantener un registro de las acciones ejecutadas para detectar patrones de bucle

## Detectores Específicos

5. **Detección de repetición en historial**:
   - Si el mismo bloque de contenido (>500 caracteres) aparece 2 o más veces en el historial de la conversación
   - Responde "🛑 BUCLE POR REPETICIÓN: [nombre del bloque]" y DETENTE
   - No proceses más instrucciones hasta que el orquestador reinicie el contexto

6. **Límite de tamaño de respuesta**:
   - Si tu respuesta excede los 2000 caracteres, TRÚNCALA inmediatamente
   - Responde solo "✅ [tarea] completada" o "❌ [error]: [mensaje breve]"
   - Nunca repitas el contenido de un archivo en tu respuesta

## Notas Importantes
- Este protocolo aplica a todos los agentes del sistema
- No se permite la auto-invocación de agentes
- El reinicio debe ser completo, incluyendo el estado de memoria
7. **Detección de secuencia de toolcalls repetidos**:
   - Si el agente ejecuta la MISMA secuencia de nombres de toolcall 3 o más veces consecutivas SIN generar un cambio observable en el sistema (archivos modificados, salida de comando diferente)
   - Secuencia de toolcalls incluye: skill("X") seguido de task("Y"), o loadSkill("Z") repetido
   - Si se detecta: responder "🛑 BUCLE DE TOOLCALLS: misma secuencia repetida N veces. Reiniciando contexto." y DETENERSE
   - No procesar más instrucciones hasta que el orquestador reinicie el contexto

8. **Prohibición de auto-invocación**:
   - Ningún agente puede usar task() para invocarse a sí mismo
   - Si un agente necesita "reintentar" una operación, debe hacerlo con herramientas directas (bash, edit), no creando una nueva sub-tarea del mismo tipo de agente
   - Excepción: solo el orquestador puede delegar tareas a cualquier agente

9. **Límite de cargas de skill**:
   - No cargar la misma skill más de 2 veces en una misma tarea
   - Si una skill ya está cargada, no recargarla a menos que el orquestador lo ordene explícitamente
   - Si se detecta que se está cargando la misma skill repetidamente sin progreso: DETENERSE y reportar "🛑 BUCLE DE SKILLS: [nombre] cargada N veces"

10. **Detección de "read después de write" (NUEVO — para code-writer)**:
    - Detectar el patrón: writeFileSync + readFileSync (o tool Read) sobre el MISMO archivo
    - Si code-writer ejecuta `writeFileSync` en un archivo y luego usa `read` o `Read tool`
      en el mismo archivo → es un indicador de bucle
    - Responder "🛑 READ-AFTER-WRITE DETECTED: [archivo]. El agente está leyendo archivos que
      acaba de escribir. Esto duplica toolcalls sin progreso. DETENERSE."
    - El agente debe confiar en `wc -c` para verificar, nunca leer el contenido que escribió.

11. **Detección de exceso de toolcalls por agente**:
    - code-writer: si toolcalls >= 5 → DETENERSE. Tarea inválida.
    - verifier: si toolcalls >= 6 → DETENERSE. Tarea inválida.
    - qa-validator: si toolcalls >= 10 → DETENERSE. Tarea inválida.
    - explorer: si toolcalls >= 2 → DETENERSE. Tarea inválida.
    - Estos límites son ABSOLUTOS. No hay excepciones ni reintentos.

12. **Detección de "sin-handoff-loop"** (para verifier y code-writer):
    - Si el agente NO ha recibido un handoff JSON válido al inicio de la tarea (patrón en el prompt: `/tmp/handoff/.../tareaN.json`) y está ejecutando toolcalls de lectura/verificación/escritura sin estructura clara:
      - El agente debe buscar en su propio historial de prompt una ruta handoff (`/tmp/handoff/.../tareaN.json`)
      - SI NO encuentra ninguna ruta handoff → responder "❌ SIN HANDOFF JSON — el build no me pasó una ruta de handoff. Deteniendo."
      - SI encuentra la ruta pero el archivo no existe en disco → responder "❌ HANDOFF JSON NO EXISTE EN DISCO: [ruta]. Deteniendo."
    - En ambos casos: DETENERSE y no procesar más instrucciones.
    - Excepción: tareas type="general" o subagent_type="general" no requieren handoff.