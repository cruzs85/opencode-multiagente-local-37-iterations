import { Injectable } from '@angular/core';
import * as L from 'leaflet';

import { RoutePoint } from '../models/route.model';

/** Subconjunto de la respuesta del API OSRM que nos interesa. */
interface OsrmResponse {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      type: 'LineString';
      /** Coordenadas en formato GeoJSON: [longitud, latitud] */
      coordinates: [number, number][];
    };
  }>;
}

/**
 * Servicio de enrutamiento por calles usando OSRM (Open Source Routing Machine).
 *
 * Utiliza el endpoint público gratuito `router.project-osrm.org`.
 * No requiere API key ni configuración adicional.
 *
 * ⚠️ OSRM usa el orden [longitud, latitud] — inverso a Leaflet [latitud, longitud].
 *    Esta clase gestiona la conversión internamente.
 */
@Injectable({ providedIn: 'root' })
export class OsrmService {
  private readonly baseUrl = 'https://router.project-osrm.org/route/v1/driving';

  /**
   * Obtiene la ruta real por calles entre una lista de puntos geográficos.
   *
   * Si OSRM no está disponible o devuelve un error, hace fallback a una
   * línea recta entre los puntos originales con un aviso en consola.
   *
   * @param points Lista de puntos de la ruta (mínimo 2).
   * @returns Array de coordenadas en formato Leaflet `[lat, lng]` listas para
   *          dibujar con `L.polyline()`. Devuelve `[]` si hay menos de 2 puntos.
   */
  async getRoute(points: RoutePoint[]): Promise<L.LatLngTuple[]> {
    if (points.length < 2) {
      return [];
    }

    // OSRM espera las coordenadas como "lng,lat" separadas por ";"
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const url = `${this.baseUrl}/${coords}?overview=full&geometries=geojson&steps=false`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OSRM respondió con HTTP ${response.status}`);
      }

      const data: OsrmResponse = await response.json();

      if (data.code !== 'Ok') {
        throw new Error(`OSRM devolvió code="${data.code}"`);
      }

      // Convertir [lng, lat] de GeoJSON → [lat, lng] de Leaflet
      return data.routes[0].geometry.coordinates.map(([lng, lat]): L.LatLngTuple => [lat, lng]);
    } catch (error) {
      console.warn(
        '[OsrmService] No se pudo obtener la ruta por calles; usando línea recta como fallback.',
        error,
      );
      // Fallback: línea recta entre los puntos originales del usuario
      return points.map((p): L.LatLngTuple => [p.lat, p.lng]);
    }
  }
}
