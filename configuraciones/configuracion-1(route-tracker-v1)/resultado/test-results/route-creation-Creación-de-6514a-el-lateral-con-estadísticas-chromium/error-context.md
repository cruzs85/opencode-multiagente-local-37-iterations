# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: route-creation.spec.ts >> Creación de ruta en RouteTracker >> debería mostrar el panel lateral con estadísticas
- Location: e2e/route-creation.spec.ts:137:7

# Error details

```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('app-route-list .sidebar__title')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic:
    - alertdialog
  - toolbar [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]: 
      - generic [ref=e8]: RouteTracker
    - generic [ref=e9]:
      - navigation [ref=e11]:
        - list [ref=e12]:
          - listitem [ref=e13]:
            - link "" [ref=e14] [cursor=pointer]:
              - /url: ""
              - generic [ref=e15]: 
          - listitem [ref=e16]:
            - img [ref=e17]
          - listitem [ref=e19]:
            - generic [ref=e21]: RouteTracker
      - button "" [ref=e23] [cursor=pointer]:
        - generic [ref=e24]: 
  - main [ref=e25]:
    - generic [active] [ref=e27]:
      - generic:
        - generic:
          - img
        - generic:
          - button "1" [ref=e30] [cursor=pointer]:
            - generic [ref=e31]: "1"
          - button "2" [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: "2"
          - button "3" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: "3"
      - generic:
        - generic [ref=e36]:
          - button "Zoom in" [ref=e37] [cursor=pointer]: +
          - button "Zoom out" [ref=e38] [cursor=pointer]: −
        - generic [ref=e39]:
          - link "Leaflet" [ref=e40] [cursor=pointer]:
            - /url: https://leafletjs.com
            - img [ref=e41]
            - text: Leaflet
          - text: "| ©"
          - link "OpenStreetMap" [ref=e45] [cursor=pointer]:
            - /url: https://www.openstreetmap.org/copyright
          - text: contributors
```

# Test source

```ts
  63  |     });
  64  |     
  65  |     const clickEvent = new MouseEvent('click', {
  66  |       view: window,
  67  |       bubbles: true,
  68  |       cancelable: true,
  69  |       clientX: x,
  70  |       clientY: y,
  71  |       button: 0,
  72  |     });
  73  |     
  74  |     // Disparar eventos en el contenedor de Leaflet
  75  |     leafletContainer.dispatchEvent(mouseDownEvent);
  76  |     leafletContainer.dispatchEvent(mouseUpEvent);
  77  |     leafletContainer.dispatchEvent(clickEvent);
  78  |     
  79  |     // También intentar disparar en el elemento en las coordenadas especificadas
  80  |     const elementAtPoint = document.elementFromPoint(x, y);
  81  |     if (elementAtPoint && elementAtPoint !== leafletContainer) {
  82  |       elementAtPoint.dispatchEvent(mouseDownEvent);
  83  |       elementAtPoint.dispatchEvent(mouseUpEvent);
  84  |       elementAtPoint.dispatchEvent(clickEvent);
  85  |     }
  86  |   }, { x: clickX, y: clickY });
  87  |   
  88  |   // Esperar entre clics para que Angular procese los cambios
  89  |   await page.waitForTimeout(500);
  90  | }
  91  | 
  92  | test.describe('Creación de ruta en RouteTracker', () => {
  93  |   test('debería crear una ruta con 3 puntos en el mapa', async ({ page }) => {
  94  |     // Navegar a la aplicación
  95  |     await page.goto('/');
  96  |     
  97  |     // Esperar a que la aplicación cargue completamente
  98  |     await expect(page).toHaveTitle(/Route Tracker/);
  99  |     
  100 |     // Esperar a que el mapa se renderice completamente
  101 |     await page.waitForSelector('.leaflet-container', { state: 'visible' });
  102 |     const leafletContainer = page.locator('.leaflet-container');
  103 |     await expect(leafletContainer).toBeVisible();
  104 |     
  105 |     // Esperar a que el mapa de Leaflet esté completamente inicializado
  106 |     await page.waitForTimeout(2000);
  107 |     
  108 |     // Hacer clic en 3 ubicaciones diferentes del mapa
  109 |     for (let i = 0; i < 3; i++) {
  110 |       await clickOnMap(page, leafletContainer, i);
  111 |     }
  112 |     
  113 |     // Esperar a que los marcadores se rendericen
  114 |     await page.waitForTimeout(1500);
  115 |     
  116 |     // Verificar que se hayan creado marcadores en el DOM
  117 |     // Los marcadores de Leaflet tienen la clase 'numbered-marker'
  118 |     const markers = page.locator('.numbered-marker');
  119 |     const markerCount = await markers.count();
  120 |     
  121 |     // Verificar que haya exactamente 3 marcadores
  122 |     expect(markerCount).toBe(3);
  123 |     
  124 |     // Verificar que los marcadores tengan números del 1 al 3
  125 |     for (let i = 0; i < 3; i++) {
  126 |       const marker = markers.nth(i);
  127 |       await expect(marker).toBeVisible();
  128 |       
  129 |       // Verificar que el marcador contenga el número correcto
  130 |       const markerHtml = await marker.innerHTML();
  131 |       expect(markerHtml).toContain(`>${i + 1}<`);
  132 |     }
  133 |     
  134 |     console.log('Test completado exitosamente: Se crearon 3 marcadores en el mapa');
  135 |   });
  136 | 
  137 |   test('debería mostrar el panel lateral con estadísticas', async ({ page }) => {
  138 |     // Navegar a la aplicación
  139 |     await page.goto('/');
  140 |     
  141 |     // Esperar a que la aplicación cargue completamente
  142 |     await expect(page).toHaveTitle(/Route Tracker/);
  143 |     
  144 |     // Esperar a que el mapa se renderice completamente
  145 |     await page.waitForSelector('.leaflet-container', { state: 'visible' });
  146 |     const leafletContainer = page.locator('.leaflet-container');
  147 |     await expect(leafletContainer).toBeVisible();
  148 |     
  149 |     // Esperar a que el mapa de Leaflet esté completamente inicializado
  150 |     await page.waitForTimeout(2000);
  151 |     
  152 |     // Hacer clic en 3 ubicaciones diferentes del mapa
  153 |     for (let i = 0; i < 3; i++) {
  154 |       await clickOnMap(page, leafletContainer, i);
  155 |     }
  156 |     
  157 |     // Esperar a que los marcadores se rendericen
  158 |     await page.waitForTimeout(1500);
  159 |     
  160 |     // Esperar a que el sidebar se renderice completamente
  161 |     // El sidebar está dentro del componente app-route-list
  162 |     // Primero esperar a que el título del sidebar esté en el DOM (no necesariamente visible)
> 163 |     await page.waitForSelector('app-route-list .sidebar__title', { state: 'attached', timeout: 10000 });
      |                ^ TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
  164 |     
  165 |     // Verificar que el sidebar esté en el DOM
  166 |     const sidebar = page.locator('app-route-list .sidebar');
  167 |     await expect(sidebar).toBeAttached();
  168 |     
  169 |     // Verificar que el contador de puntos sea "3" después de crear 3 puntos
  170 |     const pointsCountElement = page.locator('app-route-list .active-route-stats .stat__value').first();
  171 |     await expect(pointsCountElement).toBeAttached();
  172 |     await expect(pointsCountElement).toHaveText('3');
  173 |     
  174 |     // Verificar que el contador de distancia sea mayor a "0"
  175 |     const distanceElement = page.locator('app-route-list .active-route-stats .stat__value').nth(1);
  176 |     await expect(distanceElement).toBeAttached();
  177 |     const distanceText = await distanceElement.textContent();
  178 |     expect(distanceText).not.toBe('0');
  179 |     expect(distanceText).not.toBe('0 m');
  180 |     expect(distanceText).not.toBe('0 km');
  181 |     
  182 |     // Verificar que el título "Rutas guardadas" esté en el DOM sin strict mode violation
  183 |     // SELECTOR CORRECTO para evitar duplicados: 'app-route-list .sidebar__section--routes .sidebar__section-title'
  184 |     const savedRoutesTitle = page.locator('app-route-list .sidebar__section--routes .sidebar__section-title');
  185 |     await expect(savedRoutesTitle).toBeAttached();
  186 |     await expect(savedRoutesTitle).toContainText('Rutas guardadas');
  187 |     
  188 |     console.log('Test completado exitosamente: Panel lateral con estadísticas mostrado correctamente');
  189 |   });
  190 | 
  191 |   test('debería permitir deshacer el último punto', async ({ page }) => {
  192 |     // Navegar a la aplicación
  193 |     await page.goto('/');
  194 |     
  195 |     // Esperar a que la aplicación cargue completamente
  196 |     await expect(page).toHaveTitle(/Route Tracker/);
  197 |     
  198 |     // Esperar a que el mapa se renderice completamente
  199 |     await page.waitForSelector('.leaflet-container', { state: 'visible' });
  200 |     const leafletContainer = page.locator('.leaflet-container');
  201 |     await expect(leafletContainer).toBeVisible();
  202 |     
  203 |     // Esperar a que el mapa de Leaflet esté completamente inicializado
  204 |     await page.waitForTimeout(2000);
  205 |     
  206 |     // Crear 3 puntos
  207 |     for (let i = 0; i < 3; i++) {
  208 |       await clickOnMap(page, leafletContainer, i);
  209 |     }
  210 |     
  211 |     // Esperar a que los marcadores se rendericen
  212 |     await page.waitForTimeout(1500);
  213 |     
  214 |     // Esperar a que el sidebar se renderice completamente
  215 |     await page.waitForSelector('app-route-list .sidebar__title', { state: 'attached', timeout: 10000 });
  216 |     
  217 |     // Verificar que el contador sea "3" antes de deshacer
  218 |     const pointsCountElement = page.locator('app-route-list .active-route-stats .stat__value').first();
  219 |     await expect(pointsCountElement).toBeAttached();
  220 |     await expect(pointsCountElement).toHaveText('3');
  221 |     
  222 |     // Esperar a que los botones estén activos
  223 |     await waitForActiveRouteButtons(page);
  224 |     
  225 |     // Hacer clic en botón "Deshacer"
  226 |     const undoButton = page.locator(SELECTORS.undoButton);
  227 |     await undoButton.click();
  228 |     
  229 |     // Esperar a que Angular procese el cambio
  230 |     await waitForAngularStability(page);
  231 |     await page.waitForTimeout(500);
  232 |     
  233 |     // Verificar que el contador sea "2" después de deshacer
  234 |     await expect(pointsCountElement).toHaveText('2');
  235 |     
  236 |     // Verificar que solo haya 2 marcadores visibles
  237 |     const markers = page.locator('.numbered-marker');
  238 |     const markerCount = await markers.count();
  239 |     expect(markerCount).toBe(2);
  240 |     
  241 |     console.log('Test completado exitosamente: Último punto deshecho correctamente');
  242 |   });
  243 | });
  244 | 
```