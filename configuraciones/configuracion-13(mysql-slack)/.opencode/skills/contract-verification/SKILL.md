---
name: contract-verification
description: Antes de implementar cualquier archivo que dependa de otro, verifica que los nombres de métodos, propiedades e interfaces sean consistentes con los archivos ya escritos. Úsala cuando code-writer vaya a implementar un componente que llama a un servicio, o un servicio que implementa una interfaz.
---

## Propósito
Prevenir errores de integración entre archivos: nombre de método incorrecto, firma de función diferente, propiedad que no existe.

## Protocolo obligatorio

Antes de escribir cualquier archivo que CONSUMA otro (componente que usa servicio, servicio que implementa interfaz):

1. Lee el archivo que vas a consumir
2. Anota los nombres EXACTOS de: métodos públicos, propiedades públicas, tipos exportados
3. Usa esos nombres exactos en el archivo que vas a escribir
4. Nunca asumas un nombre — siempre verifica leyendo el archivo fuente

## Errores que previene
- Previene llamar a updateHighScore() cuando el método se llama updateIfHigher()
- Previene usar una propiedad que no existe en la interfaz
- Previene importar un tipo con nombre incorrecto