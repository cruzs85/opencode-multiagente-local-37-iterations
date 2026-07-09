---
name: angular-patterns
description: Reglas estrictas de sintaxis Angular para del Proyecto.
---
## Arquitectura Standalone
- Componentes: standalone:true, prefijo 'app-', inject() vs constructor.
- Archivos: Separar .html y .scss.

## Signals & Estado
- Servicios: @Injectable({providedIn:'root'}).
- Privado: `_val = signal(x)`. Público: `val = this._val.asReadonly()`.
- Lógica: Usar `computed()` para derivados.

## Estructuras de Control (Sintaxis v17+)
- `@if(cond){}`, `@for(item of list; track item.id){}`, `@switch`.
- Template: Invocar signals como función `{{ sig() }}`.

## Effects & Injector
- Fuera de constructor: `private injector = inject(Injector); effect(fn, {injector: this.injector});`.

## Estilos
- BEM + SCSS, `:host` obligatorio, variables locales.

## Imports Core
signal, computed, effect, inject, Injectable, Component, Injector, input, output.