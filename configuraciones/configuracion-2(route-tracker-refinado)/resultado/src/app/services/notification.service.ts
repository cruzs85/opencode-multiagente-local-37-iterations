import { Injectable, signal } from '@angular/core';
import { Notificacion, TipoNotificacion } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notificaciones = signal<Notificacion[]>([]);

  readonly notificaciones = this._notificaciones.asReadonly();

  agregar(mensaje: string, tipo: TipoNotificacion = 'success'): void {
    const notificacion: Notificacion = {
      identificador: crypto.randomUUID(),
      mensaje,
      tipo,
    };
    this._notificaciones.update((list) => [...list, notificacion]);
    setTimeout(() => this.eliminar(notificacion.identificador), 5000);
  }

  eliminar(identificador: string): void {
    this._notificaciones.update((list) => list.filter((n) => n.identificador !== identificador));
  }
}
