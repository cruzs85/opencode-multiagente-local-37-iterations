---
name: qa-protocol
description: Protocolo de validación técnica y funcional para RouteTracker.
---
## Validación Técnica
- **Standalone Check**: Confirmar que no se hayan introducido `NgModules`.
- **Injection Check**: Verificar que toda nueva dependencia use `inject()`.
- **Signal Integrity**: Asegurar que los efectos (`effect`) no tengan efectos secundarios cíclicos.
- **Leaflet SSR**: Validar que cualquier referencia a `L` o `map` esté envuelta en `afterNextRender()`.

## Validación Funcional
- **Mapa**: El contenedor del mapa debe tener dimensiones definidas o no se renderizará.
- **IndexedDB**: Las operaciones de guardado deben ser asíncronas y manejar errores de cuota.
- **Signals**: Los cambios en el estado deben reflejarse en la UI sin recarga manual.

## Criterios de Rechazo
- Uso de `constructor` para inyección de dependencias.
- Presencia de Zone.js manual o `changeDetectorRef.detectChanges()`.
- Errores de TypeScript en modo estricto.