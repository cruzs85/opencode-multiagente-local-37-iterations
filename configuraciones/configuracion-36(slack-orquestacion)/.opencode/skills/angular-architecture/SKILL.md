---
name: angular-architecture
description: Estructura de proyectos Angular 21 (archivos, directorios, configuracion) para descubrimiento
---

# Arquitectura de Proyectos Angular 21

## Identidad del proyecto
- Framework: **Angular 21** (NO Next.js, NO React, NO Vue)
- Archivo de configuracion principal: **`angular.json`**
- Gestor de paquetes: npm (package.json)
- Lenguaje: TypeScript (`.ts`)
- Estilos: SCSS (`.scss`)
- Templates: HTML (`.html`)

## Archivos que NO existen en Angular
Los siguientes archivos NO son parte de Angular. Si glob no los encuentra, es normal:
- `next.config.*` — Next.js, no Angular
- `vite.config.*` — Vite, no Angular builder
- `tailwind.config.*` — opcional, no forma parte del core

## Estructura esperada de directorios
```
dino-runner/                  ← raiz del proyecto
├── angular.json              ← config principal
├── package.json
├── playwright.config.ts      ← solo si hay E2E
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── src/
│   ├── index.html
│   ├── main.ts               ← entry point
│   ├── styles.scss           ← estilos globales
│   └── app/                  ← codigo de la aplicacion
│       ├── app.ts            ← componente raiz
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── app.html
│       ├── app.scss
│       ├── welcome/          ← componente standalone
│       │   └── welcome.component.ts, .html, .scss, .spec.ts
│       ├── game/
│       │   └── game.component.ts, .html, .scss, .spec.ts
│       ├── game-over/
│       │   └── game-over.component.ts, .html, .scss, .spec.ts
│       └── services/
│           └── game.service.ts, high-score.service.ts
└── e2e/                      ← solo si hay tests E2E
    └── *.e2e.spec.ts
```

## Que buscar al diagnosticar
1. `angular.json` — para entender la config del proyecto
2. `src/app/` — el codigo fuente
3. `package.json` — dependencias y scripts
4. `src/app/app.config.ts` — providers globales
5. `src/app/app.routes.ts` — definicion de rutas
6. `src/app/app.ts` — componente raiz (selector, imports)
