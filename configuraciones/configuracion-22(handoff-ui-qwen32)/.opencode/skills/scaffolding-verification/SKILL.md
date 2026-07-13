---
name: scaffolding-verification
description: Verificación post-scaffolding de proyectos Angular. Detecta y elimina archivos legacy, verifica estructura de directorios, imports correctos y ausencia de selectores duplicados.
---

# Scaffolding Verification — Post-creation checklist

## Objetivo
Verificar que el scaffolding de Angular (`ng new`, `ng generate`) no dejó archivos legacy que interfieran con el desarrollo o causen errores de compilación silenciosos.

## Responsable
- @package-manager (ejecución post-scaffolding)
- @build (delegación de verificación post-package-manager)

## Cuándo ejecutar
- Después de cada scaffolding inicial (`ng new`)
- Después de `ng generate component` (si existe `src/app/app/` legacy, puede crear dentro de él)
- Después de migraciones o refactors grandes que toquen `src/app/`

---

## ⚠️ REGLA CRÍTICA: Verificar ANTES de rm -rf .ng-temp

**NUNCA ejecutes `rm -rf .ng-temp` sin antes verificar que la copia fue exitosa.**

Si `cp -rf` falla (por permisos, espacio en disco, o archivo bloqueante como `package.json` existente), al borrar `.ng-temp` se pierde la única copia del proyecto Angular y hay que reiniciar desde cero.

### 0. Verificación pre-rm (OBLIGATORIO — ejecutar entre cp y rm)

```bash
# Check 0a: angular.json debe existir en el destino
test -f angular.json && echo "✅ angular.json existe" || echo "⛔ FALLO: angular.json NO EXISTE"

# Check 0b: package.json debe ser de Angular (contener @angular/core)
grep -q "@angular/core" package.json && echo "✅ package.json es de Angular" || echo "⛔ FALLO: package.json NO contiene @angular/core — es del workspace original"

# Check 0c: src/main.ts debe existir
test -f src/main.ts && echo "✅ src/main.ts existe" || echo "⛔ FALLO: src/main.ts NO EXISTE"
```

- **Si los 3 checks pasan**: `rm -rf .ng-temp` (seguro)
- **Si ALGUNO falla**: **NO borrar .ng-temp**. Reportar a build:
  ```
  ERROR: scaffolding incompleto. La copia falló.
  - angular.json: [EXISTE/NO EXISTE]
  - package.json (con @angular/core): [SI/NO]
  - src/main.ts: [EXISTE/NO EXISTE]
  Contenido de .ng-temp/:
  $(ls -la .ng-temp/)
  ```

---

## Checklist (OBLIGATORIO)

### 1. Estructura de directorios
```bash
ls -R src/app/
```
- `src/app/app/` NO debe existir (componente raíz anidado)
- Si existe → `rm -rf src/app/app/`
- `src/app/` debe contener solo archivos estándar: `app.component.ts`, `app.config.ts`, y subdirectorios (`components/`, `services/`, `models/`, etc.)

### 2. Archivos legacy planos
```bash
test -f src/app/app.ts && echo "LEGACY" || echo "OK"
test -f src/app/app.html && echo "LEGACY" || echo "OK"
test -f src/app/app.scss && echo "LEGACY" || echo "OK"
```
- Si algún legacy existe → `rm -f src/app/app.ts src/app/app.html src/app/app.scss`
- El componente raíz debe ser `app.component.ts`, no `app.ts`

### 3. main.ts imports correctos
```bash
grep "from.*app.component" src/main.ts
```
- Debe importar `AppComponent`, no `App` (del legacy `app.ts`)
- Si importa `App` → corregir import a `AppComponent`

### 4. app.spec.ts imports correctos
```bash
grep "from.*app.component" src/app/app.spec.ts
```
- Debe importar `AppComponent`, no `App`
- Si importa `App` → reescribir spec con `TestBed.createComponent(AppComponent)`

### 5. Sin selectores duplicados
```bash
grep -rn "selector:.*app-root" src/app/ | wc -l
```
- Debe ser exactamente 1 (solo `app.component.ts`)
- Si >= 2 → eliminar archivos duplicados (el legacy)

### 6. styleUrl vs styleUrls
```bash
grep -rn "styleUrls" src/app/ || echo "OK"
```
- Debe devolver 0 matches
- Si hay matches → corregir a `styleUrl` (singular)

---

## Acción correctiva

Si cualquiera de los checks falla:
1. Ejecutar la limpieza indicada (rm, reescritura de imports)
2. Re-ejecutar los checks
3. Si persiste → reportar a build con los archivos afectados
