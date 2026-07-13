---
name: integration-verification
description: Verificación de cadena de llamadas servicio-componente
---

# SKILL: integration-verification

## Propósito
Después de crear un servicio y un componente que lo consume, verificar que toda la cadena de llamadas está correctamente conectada y que no hay código huérfano (métodos definidos pero nunca llamados).

## ¿Cuándo usarla?
Después de que code-writer complete un lote de archivos que incluyan:
- Un servicio con lógica de negocio
- Un componente que consume ese servicio
- Múltiples métodos que deben encadenarse

## Pasos de verificación

### Paso 1: Identificar el método principal
Identificar el método que orquesta la funcionalidad (ej: `updateGameLoop`, `startGame`, `init`).

### Paso 2: Mapear el grafo de llamadas
Para el método principal, listar TODOS los métodos que llama internamente.
Ejemplo:
```
updateGameLoop() {
    → updateObstacles()
    → addObstacle()        ← ¿Está siendo llamado?
    → checkCollisions()    ← ¿Está siendo llamado?
    → updateScore()
    → increaseSpeed()
}
```

### Paso 3: Verificar que cada método interno tiene un callsite
Cada método definido en el servicio debe ser llamado desde al menos un lugar:
- Desde el método principal del servicio
- Desde el componente
- Desde otro método del servicio

Si un método está definido pero NUNCA es llamado → Código huérfano → REPORTAR.

### Paso 4: Verificar el flujo completo
Desde el evento de usuario hasta la actualización visual:
```
Usuario presiona Espacio
→ handleJump() en GameComponent
  → gameService.jump()
    → actualiza señal _dino
      → render() lee la nueva posición
```

Cada eslabón de esta cadena debe existir y estar conectado.

### Paso 5: Verificar parámetros
Si un método acepta parámetros (ej: `deltaTime`), verificar que:
- El callsite pasa el parámetro correcto
- El tipo del parámetro coincide

## Reporte de verificación

```text
✅ Integración verificada: [nombre del flujo]
   - Método principal: [nombre]
   - Métodos internos: [lista] - todos llamados
   - Callsite desde: [componente/evento]
   - Parámetros: [lista] - todos correctos
   - Código huérfano: [ninguno]
```

## Anti-patrones

❌ Definir `addObstacle()` y `checkCollisions()` pero nunca llamarlos desde el game loop
❌ Calcular `deltaTime` en el componente pero no pasarlo al servicio
❌ Definir un método público que no se usa desde ningún lado