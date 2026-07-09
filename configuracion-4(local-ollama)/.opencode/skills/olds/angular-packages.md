---
name: angular-packages
description: Protocolo de instalación y configuración de dependencias para el Proyecto.
---
## Protocolo de Instalación
1. **Verificación**: Antes de `npm install`, verificar compatibilidad con Angular 21 y Signals.
2. **Angular Add**: Preferir siempre `ng add` si la librería lo soporta para asegurar configuración automática en `angular.json`.
3. **Standalone**: Si la librería requiere módulos, integrarla mediante `importProvidersFrom` en `app.config.ts`.

## Configuración de Archivos
- **app.config.ts**: Punto central de inyección. Usar solo `provide*` functions.
- **angular.json**: Solo modificar `assets`, `styles` o `scripts` bajo supervisión del @explorer.
- **package.json**: Mantener versiones exactas para evitar conflictos con `idb` y `Leaflet`.

## Inyección de Dependencias
- Toda nueva librería de servicio debe inyectarse usando `inject()`.
- No permitir la creación de archivos `*.module.ts`.