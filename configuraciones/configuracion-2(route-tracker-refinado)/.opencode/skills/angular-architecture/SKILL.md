---
name: angular-architecture
description: Mapa técnico de RouteTracker (Angular 21 + Signals).
---
## Stack
Angular 21 (Standalone), Signals, Leaflet.js, idb (IndexedDB).

## Estructura Crítica
- `core/models/route.model.ts`: Tipos base (Route, RoutePoint).
- `core/services/storage.service.ts`: CRUD IndexedDB.
- `core/services/route.service.ts`: Estado global (Signals).
- `features/map/map.component.ts`: Renderizado Leaflet (Effects).

## Flujo de Estado
1. UI/Click -> `RouteService.addPoint()`.
2. `activePoints` (Signal) cambia -> `MapComponent` (Effect) redibuja.
3. Save -> `RouteService` -> `StorageService` -> IndexedDB.

## Restricciones
- Inyección: Siempre `inject()`.
- Signals: Privados `_val`, públicos `val = _val.asReadonly()`.
- Ciclo de vida: Leaflet solo en `afterNextRender()`.
- Prohibido: NgModules, Zone.js manual, Constructor injection.