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
# 1. Crear en subdirectorio temporal limpio
ng new <nombre> --directory .ng-temp --standalone --routing=false --style=scss --ssr=false --skip-git --no-interactive

# 2. Mover archivos (excluyendo .opencode/ si existe)
cp -r .ng-temp/* .
cp .ng-temp/.* . 2>/dev/null || true
rm -rf .ng-temp

# 3. Verificar que los archivos clave están en la raíz
ls angular.json package.json src/main.ts
```

### Paso 3: Post-creación
- Ejecutar `npm install`
- Ejecutar `npm run build` para validar
- NO usar `--force` en `ng new` — puede corromper archivos existentes

## Skills relacionadas
- `angular-packages`: Instalación de dependencias posterior a la creación
- `angular-architecture`: Guía de arquitectura a seguir en el nuevo proyecto
