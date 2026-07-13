import { Component, inject } from '@angular/core';
import { DistancePipe } from '../../shared/distance.pipe';
import { StatsService } from '../../core/services/stats.service';

@Component({
  selector: 'app-route-stats',
  standalone: true,
  imports: [DistancePipe],
  templateUrl: './route-stats.component.html',
  styleUrl: './route-stats.component.scss'
})
export class RouteStatsComponent {
  protected statsService = inject(StatsService);

  readonly totalRoutes = () => this.statsService.getTotalRoutes();
  
  readonly totalPoints = () => this.statsService.getTotalPoints();
  
  readonly totalDistanceMeters = () => this.statsService.getTotalDistanceMeters();
}