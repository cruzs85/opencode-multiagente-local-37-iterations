---
name: anti-loop-protocol
description: Protocolo de deteccion de bucles infinitos para agentes
---

# Protocolo de Deteccion de Bucles

## Objetivo
Garantizar que los agentes no caigan en bucles infinitos durante la ejecucion de tareas.

## Reglas Generales
1. **Monitoreo continuo**: Cada agente debe verificar que sus acciones avancen hacia un objetivo definido
2. **Reinicio automatico**: Si se detecta un bucle, reiniciar el contexto del agente
3. **Limites de ejecucion**: Establecer limites maximos de intentos para tareas repetitivas
4. **Registro de actividad**: Mantener un registro de las acciones ejecutadas para detectar patrones de bucle

## Detectores Especificos

5. **Deteccion de repeticion en historial**:
   - Si el mismo bloque de contenido (>500 caracteres) aparece 2 o mas veces en el historial
   - Responde "BUCLE POR REPETICION: [nombre del bloque]" y DETENTE
   - No proceses mas instrucciones hasta que el orquestador reinicie el contexto

6. **Deteccion de secuencia de toolcalls repetidos**:
   - Si ejecutas la MISMA secuencia de toolcalls 3 o mas veces consecutivas SIN generar un cambio observable
   - Si se detecta: responder "BUCLE DE TOOLCALLS: misma secuencia repetida N veces." y DETENERSE

7. **Limite de cargas de skill**:
   - No cargar la misma skill mas de 2 veces en una misma tarea
   - Si una skill ya esta cargada, no recargarla a menos que el orquestador lo ordene explicitamente

8. **Limite de toolcalls por agente**:
    - code-writer: toolcalls >= 8 -> DETENERSE
    - qa-validator: toolcalls >= 10 -> DETENERSE
    - explorer: toolcalls >= 2 -> DETENERSE
    - Estos limites son ABSOLUTOS. No hay excepciones ni reintentos.

9. **Deteccion de "borrar y empezar de nuevo"**:
   - Si ejecutas `rm -rf src/app/`, `rm src/app/*` o similar para borrar toda la carpeta app
   - Si es la PRIMERA vez: permitir, pero dejar nota "REINICIO DE APP"
   - Si es la SEGUNDA vez o mas: responde "BUCLE POR REINICIO: la carpeta src/app/ fue borrada N veces." y DETENTE
   - Previene el patron de "borrar todo porque el build fallo" en vez de corregir errores especificos.

10. **Limite de compilaciones fallidas sin progreso**:
    - Si el build falla 3 veces SEGUIDAS con los MISMOS errores exactos (sin cambios entre intentos)
    - Responde "BUCLE DE BUILD: mismo error N veces sin progreso. Abortando." y DETENTE

11. **Deteccion de proyecto manual**:
    - Si code-writer crea manualmente package.json, angular.json, tsconfig.json (sin usar ng new)
    - Detectar por: escribir archivos de configuracion del proyecto en vez de usar scaffolding
    - Si se detecta responder "PROYECTO MANUAL DETECTADO: No crear archivos de configuracion a mano. ng new fallo? Abortar y reportar."
    - DETENTE y no continues. El proyecto manual siempre produce configuraciones incorrectas (Jest vs Vitest, zone.js incluido, TypeScript incompatible).

12. **Deteccion de fallback a version anterior de Angular**:
    - Si code-writer ejecuta `npx @angular/cli@17` o `npx @angular/cli@^17` o `npx @angular/cli@18` o `npx @angular/cli@^19` para hacer scaffolding o upgrade
    - O si modifica package.json para cambiar @angular/* a versiones < 21
    - Responder "FALLBACK A ANGULAR < 21 DETECTADO: No usar versiones anteriores de Angular. ng new con Angular 21 fallo? ABORTAR y reportar el error exacto."
    - DETENTE. No continuar con scaffolding ni upgrade manual.
