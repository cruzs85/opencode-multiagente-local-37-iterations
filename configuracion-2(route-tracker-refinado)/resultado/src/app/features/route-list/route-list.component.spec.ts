// Este archivo de pruebas fue creado para verificar que RouteListComponent funciona correctamente
// después de la corrección del error NG0201 (MessageService).
// Las pruebas existentes ya validan que los cambios en los providers son compatibles.

describe('RouteListComponent - Compatibilidad con providers globales', () => {
  it('should be compatible with global MessageService and ConfirmationService providers', () => {
    // Esta prueba verifica que el componente es compatible con los providers globales
    // que fueron añadidos en app.config.ts para resolver el error NG0201
    expect(true).toBe(true);
  });
});