import { Injectable, computed, inject, signal } from '@angular/core';
import { Route, RoutePoint, CreateRouteDto } from '../models/route.model';
import { StorageService } from './storage.service';

/**
 * Servicio central de la aplicación RouteTracker.
 *
 * Responsabilidades:
 * - Mantener el estado reactivo de la ruta activa (en construcción) y las
 *   rutas guardadas mediante Angular Signals.
 * - Delegar la persistencia en `StorageService`.
 * - Calcular la distancia total de la ruta activa.
 * - Gestionar qué ruta guardada está cargada en el mapa (`displayedRoute`).
 */
@Injectable({ providedIn: 'root' })
export class RouteService {
  private readonly storage = inject(StorageService);

  // ── Estado privado mutable ───────────────────────────────────────────────

  /** Puntos de la ruta que el usuario está construyendo en este momento. */
  private readonly _activePoints = signal<RoutePoint[]>([]);

  /** Lista de rutas persistidas en IndexedDB. */
  private readonly _savedRoutes = signal<Route[]>([]);

  /** Ruta actualmente visualizada en el mapa (puede ser una ruta guardada o null). */
  private readonly _displayedRoute = signal<Route | null>(null);

  /** Indica si hay una operación de guardado en curso. */
  private readonly _isSaving = signal(false);

  // ── Señales públicas de solo lectura ────────────────────────────────────

  readonly activePoints = this._activePoints.asReadonly();
  readonly savedRoutes = this._savedRoutes.asReadonly();
  readonly displayedRoute = this._displayedRoute.asReadonly();
  readonly isSaving = this._isSaving.asReadonly();

  /**
   * Computed: distancia total en metros de la ruta activa.
   * Se recalcula automáticamente cada vez que `_activePoints` cambia.
   */
  readonly activeDistanceMeters = computed(() => this.calculateDistance(this._activePoints()));

  /**
   * Computed: `true` cuando la ruta activa tiene al menos 1 punto.
   */
  readonly hasActiveRoute = computed(() => this._activePoints().length > 0);

  // ── Inicialización ──────────────────────────────────────────────────────

  constructor() {
    // Carga las rutas guardadas al iniciar el servicio.
    this.loadSavedRoutes();
  }

  // ── Gestión de la ruta activa ───────────────────────────────────────────

  /**
   * Añade un punto al final de la ruta activa.
   * Limpia la `displayedRoute` para indicar que estamos construyendo una nueva.
   */
  addPoint(point: RoutePoint): void {
    this._activePoints.update((pts) => [...pts, point]);
    this._displayedRoute.set(null);
  }

  /**
   * Elimina el último punto de la ruta activa (undo del último click).
   */
  removeLastPoint(): void {
    this._activePoints.update((pts) => pts.slice(0, -1));
  }

  /**
   * Borra todos los puntos de la ruta activa.
   */
  clearActiveRoute(): void {
    this._activePoints.set([]);
  }

  // ── Persistencia ────────────────────────────────────────────────────────

  /**
   * Persiste la ruta activa con el nombre indicado.
   * Actualiza `savedRoutes` y limpia `activePoints` tras guardar.
   *
   * @returns La ruta guardada con el id asignado por IndexedDB.
   * @throws Si no hay puntos en la ruta activa.
   */
  async saveActiveRoute(name: string): Promise<Route> {
    const points = this._activePoints();
    if (points.length === 0) {
      throw new Error('No se puede guardar una ruta sin puntos');
    }

    const dto: CreateRouteDto = {
      name: name.trim() || 'Ruta sin nombre',
      points,
      createdAt: Date.now(),
      distanceMeters: this.calculateDistance(points),
    };

    this._isSaving.set(true);
    try {
      const saved = await this.storage.saveRoute(dto);
      this._savedRoutes.update((routes) => [saved, ...routes]);
      this._activePoints.set([]);
      return saved;
    } finally {
      this._isSaving.set(false);
    }
  }

  /**
   * Carga todas las rutas desde IndexedDB y actualiza el signal `savedRoutes`.
   */
  async loadSavedRoutes(): Promise<void> {
    const routes = await this.storage.getAllRoutes();
    this._savedRoutes.set(routes);
  }

  /**
   * Elimina una ruta guardada por su id.
   * Si la ruta eliminada era la `displayedRoute`, la limpia del mapa.
   */
  async deleteRoute(id: number): Promise<void> {
    await this.storage.deleteRoute(id);
    this._savedRoutes.update((routes) => routes.filter((r) => r.id !== id));
    if (this._displayedRoute()?.id === id) {
      this._displayedRoute.set(null);
    }
  }

  // ── Visualización en el mapa ────────────────────────────────────────────

  /**
   * Establece la ruta a mostrar en el mapa.
   * Limpia la ruta activa para no superponer trazados.
   */
  displayRoute(route: Route): void {
    this._displayedRoute.set(route);
    this._activePoints.set([]);
  }

  /**
   * Limpia la ruta mostrada en el mapa.
   */
  clearDisplayedRoute(): void {
    this._displayedRoute.set(null);
  }

  // ── Utilitarios ─────────────────────────────────────────────────────────

  /**
   * Calcula la distancia total en metros entre una secuencia de puntos
   * usando la fórmula de Haversine.
   *
   * @param points Array de RoutePoint.
   * @returns Distancia en metros (0 si hay menos de 2 puntos).
   */
  calculateDistance(points: RoutePoint[]): number {
    if (points.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += this.haversineMeters(points[i - 1], points[i]);
    }
    return total;
  }

  /**
   * Distancia entre dos puntos geográficos mediante la fórmula de Haversine.
   * Resultado en metros.
   */
  private haversineMeters(a: RoutePoint, b: RoutePoint): number {
    const R = 6_371_000; // Radio de la Tierra en metros
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);

    const c =
      2 *
      Math.asin(
        Math.sqrt(
          sinDLat * sinDLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng,
        ),
      );

    return R * c;
  }
}
