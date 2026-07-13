import { Component, computed, inject, signal } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { Drawer } from 'primeng/drawer';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Button } from 'primeng/button';
import { Breadcrumb } from 'primeng/breadcrumb';
import { Tooltip } from 'primeng/tooltip';
import { RouteListComponent } from '../features/route-list/route-list.component';
import { MapComponent } from '../features/map/map.component';
import { RouteStatsComponent } from '../features/route-stats/route-stats.component';
import { RouteService } from '../core/services/route.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    Toolbar,
    Drawer,
    Button,
    Breadcrumb,
    Tooltip,
    Toast,
    ConfirmDialog,
    RouteListComponent,
    MapComponent,
    RouteStatsComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  protected readonly routeService = inject(RouteService);
  protected readonly sidebarVisible = signal(true);

  protected readonly breadcrumbHome: MenuItem = {
    icon: 'pi pi-home',
    command: () => this.goHome(),
  };

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => {
    const displayed = this.routeService.displayedRoute();
    if (displayed) {
      return [{ label: 'Rutas' }, { label: displayed.name }];
    }
    return [{ label: 'RouteTracker' }];
  });

  protected toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }

  protected goHome(): void {
    this.routeService.clearDisplayedRoute();
  }
}
