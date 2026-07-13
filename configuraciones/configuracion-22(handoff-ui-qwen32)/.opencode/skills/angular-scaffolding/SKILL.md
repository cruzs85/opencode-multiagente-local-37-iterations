---
name: angular-scaffolding
description: Protocolo para crear un proyecto Angular desde cero, incluso si el directorio raíz ya contiene archivos de configuración (opencode.json, AGENTS.md, .opencode/).
---

# Skill: angular-scaffolding

## Propósito
Crear un proyecto Angular dentro de un directorio que ya contiene archivos (como opencode.json, AGENTS.md, .opencode/).

## Procedimiento Obligatorio

### Paso 1: Verificar requisitos
- Node.js >= 18
- Espacio en disco suficiente
- npm instalado

### Paso 2: Elegir estrategia según si el directorio está ocupado

**Opción A — Directorio vacío (ideal):**
```
ng new <nombre> --directory . --standalone --routing=false --style=scss --ssr=false --skip-git --no-interactive
```

**Opción B — Directorio NO vacío (como este proyecto):**
```
# 1. RESPALDAR package.json existente si NO es de Angular
#    ⚠️ cp sin -f NO sobreescribe archivos existentes en Linux.
#    Si package.json del workspace existe, cp -r lo ignora silenciosamente.
if [ -f package.json ] && ! grep -q "@angular/core" package.json 2>/dev/null; then
  mv package.json package.json.backup
  echo "package.json existente respaldado como package.json.backup"
fi

# 2. Crear en subdirectorio temporal limpio
ng new <nombre> --directory .ng-temp --standalone --routing=false --style=scss --ssr=false --skip-git --no-interactive

# 3. COPIAR forzando sobreescritura (FLAG -f OBLIGATORIA)
#    Sin -f, cp ignora archivos existentes silenciosamente y el scaffolding falla
cp -rf .ng-temp/* .
cp -f .ng-temp/.* . 2>/dev/null || true

# 4. VERIFICAR ANTES DE BORRAR .ng-temp (OBLIGATORIO)
#    Confirmar que angular.json y package.json de Angular se copiaron
if [ ! -f angular.json ] || ! grep -q "@angular/core" package.json 2>/dev/null; then
  echo "ERROR: La copia falló. NO se borra .ng-temp. Revisar permisos o espacio."
  echo "Archivos esperados: angular.json, package.json (con @angular/core)"
  ls -la angular.json 2>/dev/null || echo "  angular.json: NO EXISTE"
  ls -la package.json 2>/dev/null || echo "  package.json: NO EXISTE"
  exit 1
fi
echo "✅ Verificación pre-rm: angular.json y package.json (Angular) copiados correctamente"

# 5. Solo si la verificación pasó, eliminar directorio temporal
rm -rf .ng-temp

# 6. Verificar archivos clave definitivos
ls -la angular.json package.json src/main.ts

### Paso 3: Post-creación
- Ejecutar `npm install`
- Ejecutar `npm run build` para validar
- NO usar `--force` en `ng new` — puede corromper archivos existentes

### Paso 4: Reset de estilos globales (OBLIGATORIO)
Añadir en `src/styles.scss`:

```scss
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
```

### Paso 5: Inyectar variables CSS del design system (OBLIGATORIO)
Añadir AL FINAL de `src/styles.scss` el bloque completo de variables del sistema de diseño Dark Neon:

```scss
// ==========================================
// DESIGN SYSTEM — Dinosaur Runner (Dark Neon)
// ==========================================

// Colores de fondo
--bg-primary: #0a0a0f;
--bg-secondary: #14141f;
--bg-tertiary: #1a1a2e;
--bg-game: #07070b;

// Colores de texto
--text-primary: #f0f0f0;
--text-secondary: #a0a0b0;
--text-muted: #606070;

// Colores Neon (acento)
--neon-cyan: #00f0ff;
--neon-magenta: #ff00aa;
--neon-green: #39ff14;
--neon-red: #ff1744;
--neon-yellow: #ffe600;
--neon-purple: #bb00ff;

// Superficies interactivas
--surface-button: #1e1e32;
--surface-button-hover: #2a2a45;
--surface-card: #14141f;
--surface-overlay: #0d0d16e0;

// Espaciado
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
--space-2xl: 64px;
```

NOTA: Las variables deben ir dentro de `:root {}` en styles.scss.

### Paso 6: Cargar Google Fonts en index.html (OBLIGATORIO)
Añadir en `<head>` de `src/index.html` ANTES de cualquier otro `<link>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Press+Start+2P&display=swap" rel="stylesheet">
```

### Paso 7: Validación post-scaffolding
Ejecutar en orden:
1. `npm run build` — debe compilar sin errores
2. Verificar que `src/styles.scss` contiene las variables CSS del design system
3. Verificar que `src/index.html` contiene los links de Google Fonts

### Paso 8: Limpieza de archivos legacy del scaffolding
Eliminar archivos generados por `ng new` que interfieren con code-writer (crean selectores duplicados `app-root`):
```bash
rm -f src/app/app.ts src/app/app.html src/app/app.scss src/app/app.component.spec.ts
```

### Paso 9: Inventario de archivos resultante
Ejecutar para que code-writer y verifier sepan exactamente qué archivos existen antes de escribir:
```bash
ls -la src/app/ > /tmp/ng-files-inventory.txt
cat /tmp/ng-files-inventory.txt
```

## Skills relacionadas
- `angular-packages`: Instalación de dependencias posterior a la creación
- `angular-architecture`: Guía de arquitectura a seguir en el nuevo proyecto
- `ui-design-system`: Sistema de diseño visual del proyecto
- `design-verification`: Verificación de cumplimiento visual post-implementación
