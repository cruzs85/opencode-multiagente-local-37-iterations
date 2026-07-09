import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RouteService } from '../../core/services/route.service';
import { GeolocationService } from '../../core/services/geolocation.service';
import { Route } from '../../core/models/route.model';
import { DistancePipe } from '../../shared/distance.pipe';

@Component({
  selector: 'app-route-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    ConfirmDialogModule,
    ToastModule,
    DistancePipe,
  ],
  templateUrl: './route-list.component.html',
  styleUrl: './route-list.component.scss',
})
export class RouteListComponent {
  protected readonly routeService = inject(RouteService);
  protected readonly geoService = inject(GeolocationService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  protected readonly routeForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  protected get nameControl() {
    return this.routeForm.controls.name;
  }

  protected async saveRoute(): Promise<void> {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    try {
      const saved = await this.routeService.saveActiveRoute(this.routeForm.value.name!);
      this.messageService.add({
        severity: 'success',
        summary: 'Ruta guardada',
        detail: '"' + saved.name + '" se ha guardado correctamente',
      });
      this.routeForm.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido al guardar';
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: msg,
      });
    }
  }

  protected undoLastPoint(): void {
    this.routeService.removeLastPoint();
  }

  protected clearRoute(): void {
    this.routeService.clearActiveRoute();
    this.routeService.clearDisplayedRoute();
  }

  protected loadRoute(route: Route): void {
    this.routeService.displayRoute(route);
  }

  protected confirmDeleteRoute(route: Route, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Eliminar la ruta "' + route.name + '"?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: async () => {
        try {
          await this.routeService.deleteRoute(route.id!);
          this.messageService.add({
            severity: 'success',
            summary: 'Ruta eliminada',
            detail: '"' + route.name + '" ha sido eliminada',
          });
        } catch {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar la ruta',
          });
        }
      },
    });
  }

  protected toggleGps(): void {
    const status = this.geoService.permissionStatus();
    if (status === 'unsupported') return;

    if (this.geoService.currentPosition() !== null) {
      this.geoService.stopTracking();
    } else {
      this.geoService.startTracking();
    }
  }

  protected formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected isDisplayed(route: Route): boolean {
    return this.routeService.displayedRoute()?.id === route.id;
  }
}
