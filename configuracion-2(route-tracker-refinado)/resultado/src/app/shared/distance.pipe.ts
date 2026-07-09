import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe `distance`: convierte una distancia en metros a una cadena legible.
 *
 * Ejemplos:
 * - 0         → "0 m"
 * - 450       → "450 m"
 * - 1200      → "1.2 km"
 * - 15750     → "15.8 km"
 *
 * Uso en plantillas:
 * ```html
 * {{ route.distanceMeters | distance }}
 * ```
 */
@Pipe({
  name: 'distance',
  pure: true,
})
export class DistancePipe implements PipeTransform {
  transform(meters: number): string {
    if (!isFinite(meters) || meters < 0) return '—';
    if (meters === 0) return '0 m';

    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }

    const km = meters / 1000;
    // 1 decimal si < 100 km, sin decimales si es mayor
    const formatted = km < 100 ? km.toFixed(1) : Math.round(km).toString();
    return `${formatted} km`;
  }
}
