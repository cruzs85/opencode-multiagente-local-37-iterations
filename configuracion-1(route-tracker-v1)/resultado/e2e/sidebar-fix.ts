// ===== SOLUCIÓN PARA VERIFICAR COMPONENTE app-route-list =====

async function verifyRouteListComponentExists(page: any): Promise<void> {
  // OPCIÓN 1: Verificar que el componente app-route-list exista en el DOM
  const routeListComponent = page.locator('app-route-list');
  await expect(routeListComponent).toBeAttached({ timeout: 10000 });
  
  console.log('✓ Componente app-route-list existe en el DOM');
}

// ===== SOLUCIÓN 1: VERIFICAR ELEMENTOS DEL SIDEBAR DIRECTAMENTE =====

async function verifySidebarElementsDirect(page: any): Promise<void> {
  // El sidebar está dentro del componente app-route-list
  // Usar selector directo del hijo (.sidebar)
  
  const sidebar = page.locator('app-route-list .sidebar');
  await expect(sidebar).toBeAttached({ timeout: 10000 });
  console.log('✓ Sidebar existe dentro de app-route-list');
  
  // Verificar título del sidebar
  const sidebarTitle = page.locator('app-route-list .sidebar__title');
  await expect(sidebarTitle).toBeAttached({ timeout: 10000 });
  await expect(sidebarTitle).toHaveText('RouteTracker');
  console.log('✓ Título del sidebar verificado');
  
  // Verificar contador de puntos
  const pointsCount = page.locator('app-route-list .active-route-stats .stat__value').first();
  await expect(pointsCount).toBeAttached();
  console.log('✓ Contador de puntos verificado');
  
  // Verificar contador de distancia
  const distanceCount = page.locator('app-route-list .active-route-stats .stat__value').nth(1);
  await expect(distanceCount).toBeAttached();
  console.log('✓ Contador de distancia verificado');
  
  // Verificar sección de rutas guardadas
  const savedRoutesSection = page.locator('app-route-list .sidebar__section--routes');
  await expect(savedRoutesSection).toBeAttached();
  
  const savedRoutesTitle = page.locator('app-route-list .sidebar__section--routes .sidebar__section-title');
  await expect(savedRoutesTitle).toBeAttached();
  await expect(savedRoutesTitle).toContainText('Rutas guardadas');
  console.log('✓ Sección de rutas guardadas verificada');
}

// ===== SOLUCIÓN 2: USANDO page.evaluate PARA VERIFICAR DOM DIRECTAMENTE =====

async function verifySidebarUsingEvaluate(page: any): Promise<void> {
  // Verificar elementos usando page.evaluate para acceso directo al DOM
  const sidebarInfo = await page.evaluate(() => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarTitle = document.querySelector('.sidebar__title');
    const routeListComponent = document.querySelector('app-route-list');
    
    let pointsCount = null;
    let distanceCount = null;
    
    const pointsElem = document.querySelector('.active-route-stats .stat__value');
    const distanceElem = document.querySelectorAll('.active-route-stats .stat__value')[1];
    
    if (pointsElem) pointsCount = pointsElem.textContent;
    if (distanceElem) distanceCount = distanceElem.textContent;
    
    return {
      sidebarExists: !!sidebar,
      sidebarTitleExists: !!sidebarTitle,
      sidebarTitleText: sidebarTitle?.textContent || null,
      routeListComponentExists: !!routeListComponent,
      pointsCount,
      distanceCount,
      hasSavedRoutesSection: !!document.querySelector('.sidebar__section--routes'),
      savedRoutesTitleText: document.querySelector('.sidebar__section--routes .sidebar__section-title')?.textContent || null,
      sidebarVisible: sidebar ? getComputedStyle(sidebar).display !== 'none' : false,
      sidebarOpacity: sidebar ? getComputedStyle(sidebar).opacity : '0',
      sidebarTransform: sidebar ? getComputedStyle(sidebar).transform : 'none',
    };
  });
  
  console.log('✓ Información del sidebar obtenida via evaluate:');
  console.log('  - Sidebar en DOM:', sidebarInfo.sidebarExists);
  console.log('  - Título en DOM:', sidebarInfo.sidebarTitleExists);
  console.log('  - Título texto:', sidebarInfo.sidebarTitleText);
  console.log('  - Componente app-route-list en DOM:', sidebarInfo.routeListComponentExists);
  console.log('  - Contador puntos:', sidebarInfo.pointsCount);
  console.log('  - Contador distancia:', sidebarInfo.distanceCount);
  console.log('  - Tiene sección de rutas:', sidebarInfo.hasSavedRoutesSection);
  console.log('  - Título sección rutas:', sidebarInfo.savedRoutesTitleText);
  console.log('  - Sidebar visible (display none):', sidebarInfo.sidebarVisible);
  console.log('  - Opacidad:', sidebarInfo.sidebarOpacity);
  console.log('  - Transform:', sidebarInfo.sidebarTransform);
  
  // Assertions
  expect(sidebarInfo.sidebarExists).toBe(true);
  expect(sidebarInfo.sidebarTitleExists).toBe(true);
  expect(sidebarInfo.routeListComponentExists).toBe(true);
  expect(sidebarInfo.hasSavedRoutesSection).toBe(true);
}

// ===== SOLUCIÓN 3: VERIFICAR USANDO LOCATORS CON SHADOW DOM (SI ES NECESARIO) =====

async function verifySidebarWithShadowDom(page: any): Promise<void> {
  // PrimeNG drawer puede requerir acceso a shadow DOM o elementos internos
  // Usar selector CSS que cruza sombras
  
  const drawer = page.locator('p-drawer, .p-drawer').first();
  await expect(drawer).toBeAttached({ timeout: 10000 });
  
  // Verificar contenido interno
  const drawerContent = drawer.locator('.p-sidebar-content .sidebar');
  await expect(drawerContent).toBeAttached({ timeout: 10000 });
  
  console.log('✓ Sidebar dentro de p-drawer verificado');
}

// ===== FUNCIONES DE UTILIDAD COMBINADAS =====

export async function verifySidebarFully(page: any): Promise<void> {
  console.log('\n=== Verificación completa del sidebar ===\n');
  
  await verifyRouteListComponentExists(page);
  await verifySidebarElementsDirect(page);
  await verifySidebarUsingEvaluate(page);
  
  console.log('\n✓ Verificación completa del sidebar exitosa\n');
}

export async function checkSidebarIsActuallyVisible(page: any): Promise<boolean> {
  const isVisible = await page.locator('app-route-list .sidebar').isVisible();
  return isVisible;
}
