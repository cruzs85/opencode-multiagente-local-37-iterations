# Solicitud de Refactorización - Error de Tipo TypeScript

## Descripción del Error

Se ha introducido un error intencional en el tipo de la propiedad `distanceMeters` en el modelo de ruta. La propiedad ha sido cambiada de tipo `number` a `string`, lo que causa errores de TypeScript en múltiples lugares del código donde se asigna o utiliza esta propiedad.

## Ubicación Exacta del Error

**Archivo:** `/mnt/docs/Desarrollo/Pruebas/proyecto-didactico/route-tracker/src/app/core/models/route.model.ts`
**Línea:** 22
**Cambio realizado:** `distanceMeters: number;` → `distanceMeters: string;`

## Error de TypeScript Generado

Al ejecutar `npm run build`, se obtienen los siguientes errores:

### Error Principal:
```
TS2322: Type 'number' is not assignable to type 'string'.
src/app/core/services/route.service.ts:102:6:
  102 │       distanceMeters: this.calculateDistance(points),
```

### Errores Secundarios:
1. **stats.service.ts:47** - Error en reducción de distancias: `Type 'string' is not assignable to type 'number'`
2. **stats.service.ts:52** - Error al pasar valor a BehaviorSubject: `Argument of type 'Route' is not assignable to parameter of type 'number'`
3. **route-list.component.html:109** - Error en template: `Argument of type 'string' is not assignable to parameter of type 'number'`

## Instrucción Específica de Refactorización

**Restaurar el tipo correcto de `distanceMeters` a `number` en route.model.ts**

### Pasos a seguir:

1. Abrir el archivo `/mnt/docs/Desarrollo/Pruebas/proyecto-didactico/route-tracker/src/app/core/models/route.model.ts`
2. Localizar la línea 22
3. Cambiar `distanceMeters: string;` de vuelta a `distanceMeters: number;`
4. Guardar el archivo
5. Ejecutar `npm run build` para verificar que no hay errores de TypeScript
6. Ejecutar `npm test` para asegurar que los tests pasan

### Archivos afectados que deberían funcionar correctamente después de la corrección:

1. `src/app/core/services/route.service.ts` - Línea 102 (asignación en método `saveActiveRoute`)
2. `src/app/core/services/stats.service.ts` - Líneas 47 y 52 (cálculo de estadísticas)
3. `src/app/features/route-list/route-list.component.html` - Línea 109 (pipe de distancia en template)

## Validación Esperada

Después de realizar la refactorización:
- `npm run build` debería ejecutarse sin errores
- `npm test` debería pasar completamente
- La aplicación debería compilar y funcionar correctamente

## Nota

Este error fue introducido intencionalmente como parte de un ejercicio de refactorización para demostrar cómo los errores de tipo en TypeScript se propagan a través del sistema y cómo la corrección en un solo lugar (el modelo) resuelve múltiples errores en diferentes partes de la aplicación.