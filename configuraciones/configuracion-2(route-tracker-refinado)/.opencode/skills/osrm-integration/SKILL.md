---
name: osrm-integration
description: Guía de implementación OSRM (API de Rutas).
---
## Endpoint & Formato
GET `https://router.project-osrm.org/route/v1/driving/{lng,lat;lng,lat}?overview=full&geometries=geojson`

## Conversión Obligatoria
- Request: `RoutePoint` -> `${p.lng},${p.lat}` (OSRM requiere Longitud primero).
- Response: `[lng, lat]` -> `[lat, lng]` (Leaflet requiere Latitud primero).

## Requisitos del Servicio (OsrmService)
- Método: `async getRoute(points: RoutePoint[]): Promise<L.LatLngTuple[]>`
- Fallback: Si falla API, retornar línea recta (LatLng original).
- Ubicación: `src/app/core/services/osrm.service.ts`.