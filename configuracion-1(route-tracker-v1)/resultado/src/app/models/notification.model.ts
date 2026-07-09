export type TipoNotificacion = 'success' | 'error';

export interface Notificacion {
  identificador: string;
  mensaje: string;
  tipo: TipoNotificacion;
}
