# SKILL: angular-boilerplate-check

## Propósito
Verificar que todo componente Angular nuevo cumpla con los requisitos mínimos de la arquitectura moderna del proyecto.

## ¿Cuándo usarla?
Después de que code-writer cree o modifique cualquier componente Angular.

## Checklist obligatorio

Ejecutar esta checklist para cada componente creado o modificado:

- [ ] `standalone: true` está presente en el decorador @Component
- [ ] Usa `styleUrl` (singular, string) — NO `styleUrls` (plural, array)
- [ ] Usa `inject()` para toda inyección de dependencias — NO constructor con parámetros
- [ ] Si accede a `window`, `document`, canvas API o cualquier API del navegador → debe estar dentro de `afterNextRender()`
- [ ] Si registra event listeners en window/document/elementos fuera del template → debe limpiarlos en `destroyRef.onDestroy()`
- [ ] El selector comienza con `app-`
- [ ] Template y estilos están en archivos separados (.html, .scss)
- [ ] Los templates usan `@if`, `@for`, `@switch` — NO `*ngIf`, `*ngFor`

## Reglas de corrección

Si alguna verificación falla:
1. Reportar exactamente qué elemento falta y en qué archivo
2. Delegar a code-writer con el cambio exacto a realizar
3. No modificar el archivo directamente

## Anti-patrones

❌ Crear un componente sin `standalone: true` — el imports se ignora, el componente no funciona
❌ Usar `styleUrls` (plural) en vez de `styleUrl` (singular)
❌ Acceder a `document` o `window` fuera de `afterNextRender()` — rompe SSR
❌ No limpiar event listeners — causa memory leaks
