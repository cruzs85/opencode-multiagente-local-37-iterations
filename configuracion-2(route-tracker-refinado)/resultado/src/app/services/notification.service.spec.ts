import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { TipoNotificacion } from '../models/notification.model';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have empty notifications initially', () => {
    expect(service.notificaciones()).toEqual([]);
  });

  it('should add a notification', () => {
    const mensaje = 'Test notification';
    const tipo: TipoNotificacion = 'success';
    
    service.agregar(mensaje, tipo);
    
    const notifications = service.notificaciones();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].mensaje).toBe(mensaje);
    expect(notifications[0].tipo).toBe(tipo);
    expect(notifications[0].identificador).toBeDefined();
  });

  it('should add notification with default type success', () => {
    const mensaje = 'Test notification';
    
    service.agregar(mensaje);
    
    const notifications = service.notificaciones();
    expect(notifications[0].tipo).toBe('success');
  });

  it('should add error notification', () => {
    const mensaje = 'Error notification';
    const tipo: TipoNotificacion = 'error';
    
    service.agregar(mensaje, tipo);
    
    const notifications = service.notificaciones();
    expect(notifications[0].tipo).toBe('error');
  });

  it('should remove a notification', () => {
    service.agregar('Notification 1');
    service.agregar('Notification 2');
    
    const notifications = service.notificaciones();
    expect(notifications).toHaveLength(2);
    
    const idToRemove = notifications[0].identificador;
    service.eliminar(idToRemove);
    
    const updatedNotifications = service.notificaciones();
    expect(updatedNotifications).toHaveLength(1);
    expect(updatedNotifications[0].identificador).not.toBe(idToRemove);
  });

  it('should handle removing non-existent notification', () => {
    service.agregar('Notification 1');
    
    const initialNotifications = service.notificaciones();
    expect(initialNotifications).toHaveLength(1);
    
    // Try to remove non-existent ID
    service.eliminar('non-existent-id');
    
    const finalNotifications = service.notificaciones();
    expect(finalNotifications).toHaveLength(1);
  });

  it('should generate unique IDs for notifications', () => {
    service.agregar('Notification 1');
    service.agregar('Notification 2');
    
    const notifications = service.notificaciones();
    expect(notifications[0].identificador).not.toBe(notifications[1].identificador);
  });

  it('should handle multiple notifications', () => {
    const notificationsCount = 5;
    
    for (let i = 0; i < notificationsCount; i++) {
      service.agregar(`Notification ${i + 1}`);
    }
    
    expect(service.notificaciones()).toHaveLength(notificationsCount);
  });
});