import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { RouteService } from './route.service';
import { Route } from '../models/route.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly routeService = inject(RouteService);

  // BehaviorSubjects privados
  private readonly _totalRoutes = new BehaviorSubject<number>(0);
  private readonly _totalPoints = new BehaviorSubject<number>(0);
  private readonly _totalDistanceMeters = new BehaviorSubject<number>(0);

  // Observables públicos
  readonly totalRoutes$ = this._totalRoutes.asObservable();
  readonly totalPoints$ = this._totalPoints.asObservable();
  readonly totalDistanceMeters$ = this._totalDistanceMeters.asObservable();

  constructor() {
    // Suscribirse a cambios en savedRoutes usando toObservable()
    toObservable(this.routeService.savedRoutes).subscribe((routes: Route[]) => {
      this.updateStats(routes);
    });
  }

  // Métodos getter sincrónicos
  getTotalRoutes(): number {
    return this._totalRoutes.getValue();
  }

  getTotalPoints(): number {
    return this._totalPoints.getValue();
  }

  getTotalDistanceMeters(): number {
    return this._totalDistanceMeters.getValue();
  }

  // Método privado para actualizar estadísticas
  private updateStats(routes: Route[]): void {
    const totalRoutes = routes.length;
    
    const totalPoints = routes.reduce((acc, route) => acc + route.points.length, 0);
    
    const totalDistanceMeters = routes.reduce((acc, route) => acc + route.distanceMeters, 0);

    // Actualizar los BehaviorSubjects
    this._totalRoutes.next(totalRoutes);
    this._totalPoints.next(totalPoints);
    this._totalDistanceMeters.next(totalDistanceMeters);
  }
}