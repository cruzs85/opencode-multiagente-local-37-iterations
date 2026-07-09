import { Injectable, OnDestroy, signal, Signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Estados posibles del permiso de geolocalización. */
export type GeolocationPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

/** Resultado tipado de una posición o error de geolocalización. */
export interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

/**
 * Wrapper de la API nativa `navigator.geolocation` con soporte reactivo
 * (Observable y Angular Signals).
 *
 * - `position$`: Observable que emite cada vez que el dispositivo informa
 *   una nueva posición (vía `watchPosition`).
 * - `currentPosition`: Signal con la última posición conocida (null hasta
 *   la primera lectura).
 * - `permissionStatus`: Signal con el estado de permisos.
 *
 * El watcher se inicia con `startTracking()` y se detiene con `stopTracking()`
 * o automáticamente en `ngOnDestroy`.
 */
@Injectable({ providedIn: 'root' })
export class GeolocationService implements OnDestroy {
  private readonly _position$ = new Subject<GeoPosition>();
  private readonly _currentPosition = signal<GeoPosition | null>(null);
  private readonly _permissionStatus = signal<GeolocationPermission>(
    this.isSupported() ? 'prompt' : 'unsupported',
  );
  private watchId: number | null = null;

  /** Observable de posiciones en tiempo real. */
  readonly position$: Observable<GeoPosition> = this._position$.asObservable();

  /** Signal de solo lectura con la última posición conocida. */
  readonly currentPosition: Signal<GeoPosition | null> = this._currentPosition.asReadonly();

  /** Signal de solo lectura con el estado del permiso de geolocalización. */
  readonly permissionStatus: Signal<GeolocationPermission> = this._permissionStatus.asReadonly();

  /** Opciones por defecto para `watchPosition`. */
  private readonly watchOptions: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10_000,
    maximumAge: 1_000,
  };

  /**
   * Devuelve `true` si la API de Geolocalización está disponible en el browser.
   */
  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Obtiene la posición actual una sola vez (Promise).
   * Útil para centrar el mapa al inicio sin activar el watcher continuo.
   */
  getCurrentPosition(): Promise<GeoPosition> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation API no disponible en este navegador'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(this.toGeoPosition(pos)),
        (err) => reject(err),
        this.watchOptions,
      );
    });
  }

  /**
   * Inicia el seguimiento GPS continuo. Las nuevas posiciones se emiten
   * en `position$` y actualizan el signal `currentPosition`.
   *
   * Llamar varias veces es seguro: solo se registra un watcher a la vez.
   */
  startTracking(): void {
    if (!this.isSupported()) {
      this._permissionStatus.set('unsupported');
      return;
    }
    if (this.watchId !== null) return; // ya está activo

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const geoPos = this.toGeoPosition(pos);
        this._currentPosition.set(geoPos);
        this._position$.next(geoPos);
        this._permissionStatus.set('granted');
      },
      (err) => {
        if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
          this._permissionStatus.set('denied');
        }
        console.error('[GeolocationService] watchPosition error:', err.message);
      },
      this.watchOptions,
    );
  }

  /**
   * Detiene el seguimiento GPS activo.
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  ngOnDestroy(): void {
    this.stopTracking();
    this._position$.complete();
  }

  /** Convierte la posición nativa al tipo interno `GeoPosition`. */
  private toGeoPosition(pos: GeolocationPosition): GeoPosition {
    return {
      coords: {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudeAccuracy: pos.coords.altitudeAccuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      },
      timestamp: pos.timestamp,
    };
  }
}
