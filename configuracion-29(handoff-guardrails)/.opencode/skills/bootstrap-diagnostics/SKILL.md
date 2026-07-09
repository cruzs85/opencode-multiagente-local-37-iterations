---
name: bootstrap-diagnostics
description: Diagnostica problemas de bootstrap de Angular que resultan en página en blanco pero build exitoso. Úsala cuando los tests E2E fallen con "element not found" y el build pase sin errores.
---

# Skill: bootstrap-diagnostics

⚠️ RESTRICCIÓN DE AGENTE: Skill exclusiva de **@qa-validator**.
@build NO debe cargar esta skill. Si build necesita diagnosticar página en blanco,
debe delegar a qa-validator vía handoff.

## Propósito
Detectar errores silenciosos de arranque de Angular en entornos headless (Playwright, CI) donde el build es exitoso pero la página aparece en blanco.

## Cuándo usarla
- Build exitoso pero página en blanco
- Tests E2E fallan consistentemente con "element not found"
- No hay errores visibles en consola del servidor

## Procedimiento

### Paso 1: Verificar selectores duplicados (causa #1)
Ejecutar:
```bash
grep -rn "selector:" src/app/
```
Si hay 2+ componentes definiendo `app-root`, esa es la causa. Ejemplo de conflicto:
- `src/app/app.component.ts` o `src/app/app.ts` con `selector: 'app-root'`
- Si ambos archivos coexisten → legacy duplicado

**Solución:** Eliminar el archivo legacy y verificar que main.ts importe el correcto.

### Paso 2: Verificar imports de main.ts (ADAPTATIVO)
Ejecutar:
```bash
cat src/main.ts
```
Confirmar que el import coincide con el formato del proyecto:
- Angular 21+: `import { App } from './app/app'`
- Angular <21: `import { AppComponent } from './app/app.component'`

### Paso 3: Verificar styleUrls (plural)
Ejecutar:
```bash
grep -rn "styleUrls" src/app/
```
Si hay matches, Angular 21+ con Vite build puede fallar silenciosamente.

### Paso 4: Prueba de bootstrap mínimo
1. Reemplazar temporalmente el template de AppComponent con `<h1>BOOT_OK</h1>`
2. Eliminar todos los imports de subcomponentes del template
3. Build: `npm run build`
4. Servir: `npx http-server ./dist/dino-runner/browser -p 4200 -c-1 &`
5. Test: `curl -s http://localhost:4200 | grep BOOT_OK`
   - Si aparece "BOOT_OK" → el error está en subcomponentes o servicios
   - Si NO aparece → el error es estructural (Angular no arranca)

### Paso 5: Verificar errores en Playwright
En tests E2E, capturar todos los errores:
```typescript
const errors: string[] = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
await page.goto('http://localhost:4200');
await page.waitForTimeout(2000);
console.log('Captured errors:', errors);
```

### Paso 6: Verificar que Angular está presente
```bash
curl -s http://localhost:4200 | grep -o "ng-version=[^ ]*" | head -1
```
Si no aparece `ng-version`, Angular no se bootstraped.

## Causas comunes de página en blanco con build exitoso

| Causa | Síntoma | Detección |
|---|---|---|
| Selector duplicado `app-root` | Angular no arranca | grep "selector.*app-root" >= 2 matches |
| `styleUrls` vs `styleUrl` | Error en compilación AOT | grep "styleUrls" produce matches |
| Componente requerido no disponible | Error en bootstrap en producción | window.onerror muestra "component not found" |
| Template con error de sintaxis | Parse error silencioso | Angular devtools no aparece |
| Referencia a undefined en constructor | Runtime error antes de render | window.onerror atrapa el error |
