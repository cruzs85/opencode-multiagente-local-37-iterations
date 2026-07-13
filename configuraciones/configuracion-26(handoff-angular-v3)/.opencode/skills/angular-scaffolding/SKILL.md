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
#    Si package.json del workspace existe y NO es Angular, mv lo respalda
if [ -f package.json ] && ! grep -q "@angular/core" package.json 2>/dev/null; then
  mv package.json package.json.backup
  echo "package.json existente respaldado como package.json.backup"
fi

# 2. Crear en subdirectorio temporal limpio (--skip-install evita npm install doble)
ng new <nombre> --directory .ng-temp --standalone --routing=false --style=scss --ssr=false --skip-git --skip-install --no-interactive

# 3. COPIAR al directorio raíz — ESTRATEGIA SEGURA
#    ⚠️ NO usar 'cp -rf .ng-temp/* .' ni 'cp -f .ng-temp/.* .'
#    El glob .* incluye . y .. — cp falla silenciosamente al copiar recursivamente el propio directorio.
#    Además node_modules tiene miles de archivos que exceden el límite de argumentos del shell.
#    
#    3a. Mover archivos de configuración uno por uno (sin node_modules)
for f in package.json angular.json tsconfig.json tsconfig.app.json tsconfig.spec.json; do
  [ -f ".ng-temp/$f" ] && mv ".ng-temp/$f" "$f" 2>/dev/null
done

#    3b. Archivos ocultos (NO CRÍTICOS — skip si fallan o ya existen)
#    ⚠️ .editorconfig, .gitignore, .prettierrc, .vscode/ son configuraciones
#    de editor/IDE/git. NO afectan el build de Angular. Si ya existen en el
#    destino o el mv falla, CONTINUAR sin errores — no perder tiempo aquí.
for f in .ng-temp/.*; do
  base=$(basename "$f")
  [ "$base" = "." ] || [ "$base" = ".." ] && continue
  [ -e "$base" ] && echo "  $base ya existe en destino — saltando" && continue
  mv "$f" . 2>/dev/null && echo "  Movido $base" || echo "  $base: no crítico, continuando"
done

#    3c. Eliminar src/ previo (evita merge con scaffolding anterior fallido) y copiar fresco
rm -rf src 2>/dev/null
cp -rf .ng-temp/src .
[ -d .ng-temp/public ] && cp -rf .ng-temp/public .

# 4. VERIFICAR INMEDIATAMENTE (OBLIGATORIO)
#    Confirmar que angular.json y package.json de Angular se copiaron
if [ ! -f angular.json ] || ! grep -q "@angular/core" package.json 2>/dev/null; then
  echo "ERROR: La copia falló. NO se borra .ng-temp. Reportar a build."
  echo "Archivos esperados: angular.json, package.json (con @angular/core)"
  ls -la angular.json 2>/dev/null || echo "  angular.json: NO EXISTE"
  ls -la package.json 2>/dev/null || echo "  package.json: NO EXISTE"
  exit 1
fi
echo "✅ Verificación pre-rm: angular.json, package.json y src/main.ts OK"

# 5. Solo si la verificación pasó, eliminar directorio temporal
rm -rf .ng-temp

# (npm install y build se ejecutan en Paso 3, después de aplicar configs)

### Paso 3: Aplicar configuraciones post-creación (ANTES del build)
Ejecutar en orden:
1. `npm install` (única instalación, gracias a --skip-install en ng new)
2. Reset de estilos globales en `src/styles.scss` (Paso 4)
3. Inyectar variables CSS del design system en `src/styles.scss` (Paso 5)
4. Cargar Google Fonts en `src/index.html` (Paso 6)
5. **SOLO ENTONCES**: `npm run build` para validar todo junto
- NO usar `--force` en `ng new` — puede corromper archivos existentes

### Paso 4: Reset de estilos globales (OBLIGATORIO)
Añadir en `src/styles.scss`:

```scss
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; }
```

### Paso 5: Inyectar variables CSS del design system (OBLIGATORIO)
Añadir AL FINAL de `src/styles.scss` el bloque completo de variables del sistema de diseño Dark Neon.
⚠️ **TODAS las variables DEBEN ir dentro de `:root {}`** — CSS no permite custom properties fuera de un selector.

```scss
:root {
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
}
```

### Paso 6: Cargar Google Fonts en index.html (OBLIGATORIO)
Añadir en `<head>` de `src/index.html` ANTES de cualquier otro `<link>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Press+Start+2P&display=swap" rel="stylesheet">
```

### Paso 7: Validación post-scaffolding
Ejecutar en orden:
1. Verificar que `src/styles.scss` contiene el reset y las variables CSS dentro de `:root {}`
2. Verificar que `src/index.html` contiene los links de Google Fonts
3. `npm run build` — debe compilar sin errores (es el ÚNICO build, todas las configs ya están aplicadas)

### Paso 8: Verificar estructura del componente raíz (ADAPTATIVO)

Angular 21+ genera el root en formato plano: `app.ts`, `app.html`, `app.scss` (clase `App`, selector `app-root`).
Angular <21 generaba: `app.component.ts`, `app.component.html`, `app.component.scss` (clase `AppComponent`).

```bash
# 8a. Listar archivos para detectar el formato generado por ng new
ls -la src/app/

# 8b. Detectar el formato y verificar coherencia
if [ -f src/app/app.ts ]; then
  echo "✅ Formato Angular 21+: app.ts (clase App, selector app-root)"
  echo "   Conservar app.ts, app.html, app.scss — archivos VÁLIDOS"
  grep -q "from './app/app'" src/main.ts && echo "✅ main.ts importa App correctamente"
elif [ -f src/app/app.component.ts ]; then
  echo "✅ Formato Angular <21: app.component.ts (clase AppComponent)"
  grep -q "from './app/app.component'" src/main.ts && echo "✅ main.ts importa AppComponent correctamente"
  # Limpiar spec duplicado si existe
  rm -f src/app/app.spec.ts
else
  echo "⚠️ No se detectó componente raíz. Reportar a build."
fi
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
