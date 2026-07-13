# Protocolo de Detección de Bucles

## Objetivo
Este protocolo garantiza que los agentes no caigan en bucles infinitos durante la ejecución de tareas, asegurando la eficiencia y estabilidad del sistema.

## Reglas Generales
1. **Monitoreo continuo**: Cada agente debe verificar que sus acciones estén avanzando hacia un objetivo definido
2. **Reinicio automático**: Si se detecta un bucle, reiniciar el contexto del agente
3. **Límites de ejecución**: Establecer límites máximos de intentos para tareas repetitivas
4. **Registro de actividad**: Mantener un registro de las acciones ejecutadas para detectar patrones de bucle

## Implementación
- Cada agente debe implementar un mecanismo de detección de bucles
- Si se detecta que un agente está ejecutando la misma acción repetidamente, debe reiniciar su contexto
- Los agentes deben tener un mecanismo de "checkpoint" para verificar el progreso
- En caso de bucle, el agente debe notificar al orquestador

## Pasos de Detección
1. **Verificación de progreso**: Comparar el estado actual con el estado anterior
2. **Análisis de patrones**: Detectar acciones repetidas en ciclos
3. **Reinicio contextual**: Reiniciar el agente si se confirma un bucle
4. **Notificación**: Informar al orquestador sobre la detección de bucle

## Notas Importantes
- Este protocolo aplica a todos los agentes del sistema
- No se permite la auto-invocación de agentes
- El reinicio debe ser completo, incluyendo el estado de memoria