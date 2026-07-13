/**
 * Representa un punto geográfico en una ruta.
 */
export interface RoutePoint {
  lat: number;
  lng: number;
  /** Timestamp Unix (ms) cuando se capturó el punto. Opcional para puntos manuales. */
  timestamp?: number;
}

/**
 * Ruta guardada en IndexedDB.
 */
export interface Route {
  /** Clave primaria auto-generada por IndexedDB. Undefined antes de persistir. */
  id?: number;
  name: string;
  points: RoutePoint[];
  /** Timestamp Unix (ms) de creación. */
  createdAt: number;
  /** Distancia total en metros. */
  distanceMeters: number;
}

/**
 * Datos mínimos para crear una nueva ruta.
 */
export type CreateRouteDto = Omit<Route, 'id'>;
