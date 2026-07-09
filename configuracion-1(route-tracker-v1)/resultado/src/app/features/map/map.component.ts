import {
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  effect,
  inject,
  afterNextRender,
} from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

import { RouteService } from '../../core/services/route.service';
import { GeolocationService } from '../../core/services/geolocation.service';
import { OsrmService } from '../../core/services/osrm.service';
import { RoutePoint } from '../../core/models/route.model';

/**
 * Configura los iconos de Leaflet para que apunten a los assets
 * copiados en /leaflet/ en lugar de las rutas del bundle que el builder rompe.
 */
function configureLeafletIcons(): void {
  const iconBase = '/leaflet/';
  const defaultIcon = L.icon({
    iconUrl: `${iconBase}marker-icon.png`,
    iconRetinaUrl: `${iconBase}marker-icon-2x.png`,
    shadowUrl: `${iconBase}marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = defaultIcon;
}

/**
 * Componente principal del mapa.
 *
 * Responsabilidades:
 * - Inicializar y gestionar el ciclo de vida del mapa Leaflet.
 * - Capturar clicks en el mapa y delegarlos a RouteService.
 * - Reaccionar a cambios en la ruta activa y mostrada mediante effects.
 * - Mostrar la posición GPS en tiempo real con un marcador especial.
 */
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private readonly routeService = inject(RouteService);
  private readonly geoService = inject(GeolocationService);
  private readonly osrmService = inject(OsrmService);
  private readonly injector = inject(Injector);

  // ── Instancias Leaflet ──────────────────────────────────────────────────
  private map!: L.Map;
  /** Marcador de la posición GPS actual. */
  private gpsMarker: L.Marker | null = null;
  /** Círculo de precisión alrededor del marcador GPS. */
  private gpsAccuracyCircle: L.Circle | null = null;
  /** Marcadores de los puntos de la ruta activa. */
  private activeMarkers: L.Marker[] = [];
  /** Polilínea de la ruta activa. */
  private activePolyline: L.Polyline | null = null;
  /** Polilínea de la ruta mostrada (cargada desde guardadas). */
  private displayedPolyline: L.Polyline | null = null;
  /** Marcadores de la ruta mostrada. */
  private displayedMarkers: L.Marker[] = [];

  private gpsSubscription: Subscription | null = null;

  constructor() {
    // afterNextRender: garantiza que el DOM está listo antes de inicializar Leaflet.
    // Equivale a ngAfterViewInit pero compatible con futuras optimizaciones SSR/zoneless.
    afterNextRender(() => {
      this.initMap();
      this.startGpsTracking();
      this.registerEffects();
    });
  }

  // ── Inicialización del mapa ─────────────────────────────────────────────

  private initMap(): void {
    configureLeafletIcons();

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [40.4168, -3.7038], // Madrid como posición inicial por defecto
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Click en el mapa → añadir punto a la ruta activa
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const point: RoutePoint = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        timestamp: Date.now(),
      };
      this.routeService.addPoint(point);
    });

    // Intentar centrar el mapa en la posición actual del usuario
    this.geoService
      .getCurrentPosition()
      .then((pos) => {
        this.map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      })
      .catch(() => {
        // Sin permiso de geolocalización: se queda en Madrid, no es un error crítico.
        console.info('[MapComponent] Geolocalización no disponible; usando posición por defecto.');
      });
  }

  // ── Seguimiento GPS ─────────────────────────────────────────────────────

  private startGpsTracking(): void {
    this.geoService.startTracking();

    this.gpsSubscription = this.geoService.position$.subscribe((pos) => {
      const latlng: L.LatLngTuple = [pos.coords.latitude, pos.coords.longitude];

      if (!this.gpsMarker) {
        // Primera posición: crear marcador GPS con icono diferenciado
        const gpsIcon = L.divIcon({
          className: 'gps-marker',
          html: '<div class="gps-dot"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        this.gpsMarker = L.marker(latlng, { icon: gpsIcon, zIndexOffset: 1000 })
          .addTo(this.map)
          .bindPopup('Tu posición actual');

        this.gpsAccuracyCircle = L.circle(latlng, {
          radius: pos.coords.accuracy,
          color: '#2196f3',
          fillColor: '#2196f3',
          fillOpacity: 0.1,
          weight: 1,
        }).addTo(this.map);
      } else {
        // Posición actualizada: mover marcador y círculo existentes
        this.gpsMarker.setLatLng(latlng);
        this.gpsAccuracyCircle?.setLatLng(latlng);
        this.gpsAccuracyCircle?.setRadius(pos.coords.accuracy);
      }
    });
  }

  // ── Effects reactivos ───────────────────────────────────────────────────

  /**
   * Registra los effects de Angular que sincronizan los signals del RouteService
   * con las capas Leaflet. Se llama desde afterNextRender para asegurar que
   * `this.map` ya está inicializado.
   */
  private registerEffects(): void {
    // Effect 1: redibujar la ruta activa cuando cambian los puntos
    effect(
      () => {
        const points = this.routeService.activePoints();
        void this.renderActiveRoute(points);
      },
      { injector: this.injector },
    );

    // Effect 2: mostrar/ocultar la ruta cargada desde el panel lateral
    effect(
      () => {
        const route = this.routeService.displayedRoute();
        void this.renderDisplayedRoute(route?.points ?? null);
      },
      { injector: this.injector },
    );
  }

  // ── Renderizado de capas Leaflet ────────────────────────────────────────

  private async renderActiveRoute(points: RoutePoint[]): Promise<void> {
    // Limpiar capas anteriores
    this.activeMarkers.forEach((m) => m.removeFrom(this.map));
    this.activeMarkers = [];
    this.activePolyline?.removeFrom(this.map);
    this.activePolyline = null;

    if (points.length === 0) return;

    // Marcadores numerados en las posiciones originales del usuario
    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: this.createNumberedIcon(i + 1),
      })
        .addTo(this.map)
        .bindTooltip(`Punto ${i + 1}`);
      this.activeMarkers.push(marker);
    });

    // Polilínea por calles reales vía OSRM (fallback a línea recta si falla)
    if (points.length > 1) {
      const latlngs = await this.osrmService.getRoute(points);
      this.activePolyline = L.polyline(latlngs, {
        color: '#e53935',
        weight: 4,
        opacity: 0.85,
        dashArray: undefined,
      }).addTo(this.map);
    }
  }

  private async renderDisplayedRoute(points: RoutePoint[] | null): Promise<void> {
    // Limpiar capas de la ruta mostrada
    this.displayedMarkers.forEach((m) => m.removeFrom(this.map));
    this.displayedMarkers = [];
    this.displayedPolyline?.removeFrom(this.map);
    this.displayedPolyline = null;

    if (!points || points.length === 0) return;

    // Marcadores numerados en las posiciones originales del usuario
    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: this.createNumberedIcon(i + 1, '#1565c0'),
      })
        .addTo(this.map)
        .bindTooltip(`Punto ${i + 1}`);
      this.displayedMarkers.push(marker);
    });

    // Polilínea por calles reales vía OSRM (fallback a línea recta si falla)
    if (points.length > 1) {
      const latlngs = await this.osrmService.getRoute(points);
      this.displayedPolyline = L.polyline(latlngs, {
        color: '#1565c0',
        weight: 4,
        opacity: 0.85,
      }).addTo(this.map);
    }

    // Ajustar la vista del mapa para encuadrar todos los puntos
    this.fitMapToPoints(points);
  }

  private fitMapToPoints(points: RoutePoint[]): void {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as L.LatLngTuple));
    this.map.fitBounds(bounds, { padding: [40, 40] });
  }

  // ── Iconos ──────────────────────────────────────────────────────────────

  private createNumberedIcon(n: number, color = '#e53935'): L.DivIcon {
    return L.divIcon({
      className: 'numbered-marker',
      html: `<div class="marker-pin" style="background:${color}">${n}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }

  // ── Limpieza ────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.gpsSubscription?.unsubscribe();
    this.geoService.stopTracking();
    if (this.map) {
      this.map.remove();
    }
  }
}
