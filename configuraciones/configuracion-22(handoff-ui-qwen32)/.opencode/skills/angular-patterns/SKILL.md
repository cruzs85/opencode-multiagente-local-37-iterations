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
- `styleUrl` (singular) es OBLIGATORIO. NUNCA usar `styleUrls` (plural). Angular 21+ con Vite build depreca `styleUrls`. Verificar con: `grep -rn "styleUrls" src/app/` debe devolver 0 resultados.

## Imports Core
signal, computed, effect, inject, Injectable, Component, Injector, input, output, DestroyRef, afterNextRender.

## Signals: Inmutabilidad (OBLIGATORIO)
- NUNCA mutar el valor obtenido de signal() y pasarlo de vuelta a .set()
- Siempre crear nuevo objeto/array antes de .set():
  • `this.signal.set({ ...old, prop: newVal })`  ✅
  • `this.arraySignal.set([...oldArray, newElement])`  ✅
  • `old.val = x; this.signal.set(old)`  ❌ (misma referencia, no notifica cambio)
- `signal.update()` solo para valores primitivos (number, string, boolean) o cuando el nuevo valor no depende del anterior
- Aplica tanto al crear un servicio NUEVO como al modificar uno existente

## Event Listeners: Referencia Única (OBLIGATORIO)
- Guardar handler en propiedad de clase como arrow function:
  `private handleKey = (event: KeyboardEvent) => this.onKey(event);`
- addEventListener y removeEventListener DEBEN usar la MISMA referencia:
  • `window.addEventListener('keydown', this.handleKey);`       ✅
  • `window.removeEventListener('keydown', this.handleKey);`    ✅
  • `window.removeEventListener('keydown', this.onKey.bind(this));`  ❌
- Cleanup: implementar OnDestroy con removeEventListener, o usar
  inject(DestroyRef) + afterNextRender + destroyRef.onDestroy()
- Aplica a cualquier componente Angular que registre listeners en window/document

## Magic Numbers: Constantes con Nombre
- Toda posición, tamaño, velocidad o límite numérico debe ser una constante
  con nombre descriptivo, no un valor literal hardcodeado
- Excepción: 0, 1, valores de inicialización triviales
- Usar objetos de configuración o constantes de clase agrupadas semánticamente
- Aplica tanto a creación como a modificación de cualquier componente/servicio