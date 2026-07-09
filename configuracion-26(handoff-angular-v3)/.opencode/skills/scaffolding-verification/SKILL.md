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
- `src/app/` debe contener solo archivos estándar: `app.ts` (Angular 21+) o `app.component.ts` (Angular <21), `app.config.ts`, y subdirectorios (`components/`, `services/`, `models/`, etc.)

### 2. Archivos del componente raíz (ADAPTATIVO)
Angular 21+ genera: `app.ts`, `app.html`, `app.scss` (formato plano VÁLIDO).
Angular <21 generaba: `app.component.ts`, `app.component.html`, `app.component.scss`.

```bash
if [ -f src/app/app.ts ]; then
  echo "✅ Formato Angular 21+: app.ts / app.html / app.scss — conservar"
elif [ -f src/app/app.component.ts ]; then
  echo "✅ Formato Angular <21: app.component.ts / .html / .scss — conservar"
else
  echo "⚠️ No se detectó componente raíz. Reportar a build."
fi
```
- Si SOLO existe `app.ts` → formato Angular 21+ correcto. NO eliminar.
- Si SOLO existe `app.component.ts` → formato Angular <21 correcto. NO eliminar.
- Si AMBOS existen (`app.ts` Y `app.component.ts`) → HAY DUPLICADO. Eliminar el legacy y corregir main.ts.
  ```bash
  rm -f src/app/app.ts src/app/app.html src/app/app.scss
  ```

### 3. main.ts imports correctos (ADAPTATIVO)
```bash
if [ -f src/app/app.ts ]; then
  grep "from './app/app'" src/main.ts && echo "✅ main.ts importa App (Angular 21+)" || echo "⚠️ main.ts no coincide con app.ts"
elif [ -f src/app/app.component.ts ]; then
  grep "from './app/app.component'" src/main.ts && echo "✅ main.ts importa AppComponent (Angular <21)" || echo "⚠️ main.ts no coincide con app.component.ts"
fi
```

### 4. app.spec.ts imports correctos (ADAPTATIVO)
```bash
if [ -f src/app/app.spec.ts ]; then
  if [ -f src/app/app.ts ]; then
    grep "from './app/app'" src/app/app.spec.ts && echo "✅ spec importa App" || echo "⚠️ spec import incorrecto"
  else
    grep "from './app/app.component'" src/app/app.spec.ts && echo "✅ spec importa AppComponent" || echo "⚠️ spec import incorrecto"
  fi
fi
```

### 5. Sin selectores duplicados
```bash
grep -rn "selector:.*app-root" src/app/ | wc -l
```
- Debe ser exactamente 1 (solo root component: `app.ts` o `app.component.ts`)
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
