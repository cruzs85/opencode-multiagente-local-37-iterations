import { test, expect } from '@playwright/test';

// Helpers proporcionados
async function waitForAngularStability(page: any): Promise<void> {
  await page.waitForTimeout(300);
}

async function waitForActiveRouteButtons(page: any): Promise<void> {
  await page.waitForSelector('.save-form', { state: 'visible', timeout: 5000 });
  await Promise.all([
    page.waitForSelector(SELECTORS.saveButton, { state: 'visible' }),
    page.waitForSelector(SELECTORS.undoButton, { state: 'visible' }),
    page.waitForSelector(SELECTORS.clearButton, { state: 'visible' }),
  ]);
  await waitForAngularStability(page);
}

// Selectores proporcionados
const SELECTORS = {
  savedRoutesTitle: 'app-route-list .sidebar__section--routes .sidebar__section-title',
  saveButton: '.save-form__actions button:has-text("Guardar")',
  undoButton: '.save-form__actions button:has-text("Deshacer")',
  clearButton: '.save-form__actions button:has-text("Limpiar")',
};

// Helper para hacer clic en el mapa
async function clickOnMap(page: any, leafletContainer: any, index: number, totalClicks: number = 3): Promise<void> {
  const leafletBoundingBox = await leafletContainer.boundingBox();
  if (!leafletBoundingBox) {
    throw new Error('No se pudo obtener las dimensiones del mapa de Leaflet');
  }
  
  // Calcular coordenadas dentro del área visible del mapa
  // Usar diferentes ubicaciones para cada clic
  const clickX = leafletBoundingBox.x + leafletBoundingBox.width * (0.3 + 0.15 * index);
  const clickY = leafletBoundingBox.y + leafletBoundingBox.height * 0.5;
  
  // Usar page.evaluate para disparar eventos de clic directamente en el DOM
  // Patrón recomendado para evitar problemas con overlays
  await page.evaluate(({ x, y }) => {
    // Encontrar el elemento leaflet-container
    const leafletContainer = document.querySelector('.leaflet-container');
    if (!leafletContainer) return;
    
    // Disparar la secuencia completa de eventos del mouse
    // Leaflet necesita mousedown, mouseup y click
    const mouseDownEvent = new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: 0,
    });
    
    const mouseUpEvent = new MouseEvent('mouseup', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: 0,
    });
    
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y,
      button: 0,
    });
    
    // Disparar eventos en el contenedor de Leaflet
    leafletContainer.dispatchEvent(mouseDownEvent);
    leafletContainer.dispatchEvent(mouseUpEvent);
    leafletContainer.dispatchEvent(clickEvent);
    
    // También intentar disparar en el elemento en las coordenadas especificadas
    const elementAtPoint = document.elementFromPoint(x, y);
    if (elementAtPoint && elementAtPoint !== leafletContainer) {
      elementAtPoint.dispatchEvent(mouseDownEvent);
      elementAtPoint.dispatchEvent(mouseUpEvent);
      elementAtPoint.dispatchEvent(clickEvent);
    }
  }, { x: clickX, y: clickY });
  
  // Esperar entre clics para que Angular procese los cambios
  await page.waitForTimeout(500);
}

test.describe('Creación de ruta en RouteTracker', () => {
  test('debería crear una ruta con 3 puntos en el mapa', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');
    
    // Esperar a que la aplicación cargue completamente
    await expect(page).toHaveTitle(/Route Tracker/);
    
    // Esperar a que el mapa se renderice completamente
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();
    
    // Esperar a que el mapa de Leaflet esté completamente inicializado
    await page.waitForTimeout(2000);
    
    // Hacer clic en 3 ubicaciones diferentes del mapa
    for (let i = 0; i < 3; i++) {
      await clickOnMap(page, leafletContainer, i);
    }
    
    // Esperar a que los marcadores se rendericen
    await page.waitForTimeout(1500);
    
    // Verificar que se hayan creado marcadores en el DOM
    // Los marcadores de Leaflet tienen la clase 'numbered-marker'
    const markers = page.locator('.numbered-marker');
    const markerCount = await markers.count();
    
    // Verificar que haya exactamente 3 marcadores
    expect(markerCount).toBe(3);
    
    // Verificar que los marcadores tengan números del 1 al 3
    for (let i = 0; i < 3; i++) {
      const marker = markers.nth(i);
      await expect(marker).toBeVisible();
      
      // Verificar que el marcador contenga el número correcto
      const markerHtml = await marker.innerHTML();
      expect(markerHtml).toContain(`>${i + 1}<`);
    }
    
    console.log('Test completado exitosamente: Se crearon 3 marcadores en el mapa');
  });

  test('debería mostrar el panel lateral con estadísticas', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');
    
    // Esperar a que la aplicación cargue completamente
    await expect(page).toHaveTitle(/Route Tracker/);
    
    // Esperar a que el mapa se renderice completamente
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();
    
    // Esperar a que el mapa de Leaflet esté completamente inicializado
    await page.waitForTimeout(2000);
    
    // Hacer clic en 3 ubicaciones diferentes del mapa
    for (let i = 0; i < 3; i++) {
      await clickOnMap(page, leafletContainer, i);
    }
    
    // Esperar a que los marcadores se rendericen
    await page.waitForTimeout(1500);
    
    // Esperar a que el sidebar se renderice completamente
    // El sidebar está dentro del componente app-route-list
    // Primero esperar a que el título del sidebar esté en el DOM (no necesariamente visible)
    await page.waitForSelector('app-route-list .sidebar__title', { state: 'attached', timeout: 10000 });
    
    // Verificar que el sidebar esté en el DOM
    const sidebar = page.locator('app-route-list .sidebar');
    await expect(sidebar).toBeAttached();
    
    // Verificar que el contador de puntos sea "3" después de crear 3 puntos
    const pointsCountElement = page.locator('app-route-list .active-route-stats .stat__value').first();
    await expect(pointsCountElement).toBeAttached();
    await expect(pointsCountElement).toHaveText('3');
    
    // Verificar que el contador de distancia sea mayor a "0"
    const distanceElement = page.locator('app-route-list .active-route-stats .stat__value').nth(1);
    await expect(distanceElement).toBeAttached();
    const distanceText = await distanceElement.textContent();
    expect(distanceText).not.toBe('0');
    expect(distanceText).not.toBe('0 m');
    expect(distanceText).not.toBe('0 km');
    
    // Verificar que el título "Rutas guardadas" esté en el DOM sin strict mode violation
    // SELECTOR CORRECTO para evitar duplicados: 'app-route-list .sidebar__section--routes .sidebar__section-title'
    const savedRoutesTitle = page.locator('app-route-list .sidebar__section--routes .sidebar__section-title');
    await expect(savedRoutesTitle).toBeAttached();
    await expect(savedRoutesTitle).toContainText('Rutas guardadas');
    
    console.log('Test completado exitosamente: Panel lateral con estadísticas mostrado correctamente');
  });

  test('debería permitir deshacer el último punto', async ({ page }) => {
    // Navegar a la aplicación
    await page.goto('/');
    
    // Esperar a que la aplicación cargue completamente
    await expect(page).toHaveTitle(/Route Tracker/);
    
    // Esperar a que el mapa se renderice completamente
    await page.waitForSelector('.leaflet-container', { state: 'visible' });
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();
    
    // Esperar a que el mapa de Leaflet esté completamente inicializado
    await page.waitForTimeout(2000);
    
    // Crear 3 puntos
    for (let i = 0; i < 3; i++) {
      await clickOnMap(page, leafletContainer, i);
    }
    
    // Esperar a que los marcadores se rendericen
    await page.waitForTimeout(1500);
    
    // Esperar a que el sidebar se renderice completamente
    await page.waitForSelector('app-route-list .sidebar__title', { state: 'attached', timeout: 10000 });
    
    // Verificar que el contador sea "3" antes de deshacer
    const pointsCountElement = page.locator('app-route-list .active-route-stats .stat__value').first();
    await expect(pointsCountElement).toBeAttached();
    await expect(pointsCountElement).toHaveText('3');
    
    // Esperar a que los botones estén activos
    await waitForActiveRouteButtons(page);
    
    // Hacer clic en botón "Deshacer"
    const undoButton = page.locator(SELECTORS.undoButton);
    await undoButton.click();
    
    // Esperar a que Angular procese el cambio
    await waitForAngularStability(page);
    await page.waitForTimeout(500);
    
    // Verificar que el contador sea "2" después de deshacer
    await expect(pointsCountElement).toHaveText('2');
    
    // Verificar que solo haya 2 marcadores visibles
    const markers = page.locator('.numbered-marker');
    const markerCount = await markers.count();
    expect(markerCount).toBe(2);
    
    console.log('Test completado exitosamente: Último punto deshecho correctamente');
  });
});
