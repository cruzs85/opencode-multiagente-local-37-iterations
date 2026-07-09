# SKILL: contract-consistency

## Propósito
Antes de implementar un archivo que dependa de otro, verificar que los contratos (tipos, métodos, propiedades) sean consistentes entre ambos.

## ¿Cuándo usarla?
Siempre que code-writer vaya a implementar:
- Un componente que llama a un servicio
- Un servicio que implementa una interfaz
- Un servicio que usa tipos definidos en un modelo
- Cualquier archivo que importe de otro archivo del proyecto

## Reglas obligatorias

### Regla 1: Leer antes de escribir
Antes de escribir un archivo A que depende de un archivo B:
1. LEER el archivo B completo
2. Identificar TODOS los nombres de métodos, propiedades, tipos e interfaces que A va a usar
3. Usar EXACTAMENTE esos nombres — sin cambios, sin "alias", sin "variantes"

### Regla 2: Consistencia de tipos literales
Si el modelo define: `type: 'cactus' | 'pterodactyl'`
El servicio DEBE usar EXACTAMENTE: `'cactus'` o `'pterodactyl'`
NO usar: `'bird'`, `'cactus2'`, `'CACTUS'`

### Regla 3: Firmas de métodos
Si el servicio define: `jump(): void`
El componente DEBE llamar: `service.jump()`
NO llamar: `service.doJump()`, `service.jumpDino()`, `service.saltar()`

### Regla 4: Parámetros
Si el servicio define: `updateGameLoop(deltaTime: number)`
La llamada DEBE incluir: `service.updateGameLoop(deltaTime)`
NO: `service.updateGameLoop()` (sin el parámetro requerido)

### Regla 5: Retorno de métodos
Si un servicio devuelve un tipo, el componente debe tratar el retorno según ese tipo:
- Si devuelve `ReadonlySignal<GameData>`, leer con `service.gameData()`
- Si devuelve `DinoState`, acceder a sus propiedades directamente

## Cómo usar esta skill

1. Cargar esta skill ANTES de escribir cualquier archivo
2. Identificar el archivo del que se depende
3. Leer ese archivo con la herramienta `read` o `cat`
4. Escribir el nuevo archivo usando EXACTAMENTE los mismos nombres y tipos

## Anti-patrones

❌ Escribir un componente que llama a `gameService.jump()` sin verificar que `jump()` existe en GameService
❌ Definir un tipo `'pterodactyl'` en el modelo y usar `'bird'` en el servicio
❌ Llamar a un método sin pasar los parámetros requeridos
❌ Asumir que un método existe sin leer primero el archivo que lo define
