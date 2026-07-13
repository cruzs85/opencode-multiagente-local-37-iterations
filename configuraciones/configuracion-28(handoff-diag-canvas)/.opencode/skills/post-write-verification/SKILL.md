---
name: post-write-verification
description: Verificación rápida post-escritura. Verifica imports, styleUrl, signals y contratos en archivos recién creados.
---

# Post-Write Verification — @verifier

## Regla de muestreo (OBLIGATORIO)

Si el handoff lista **más de 5 archivos**, selecciona **SOLO**:
- **1 componente** completo: `[nombre].ts` + `[nombre].html` + `[nombre].scss`
- **1 servicio** del proyecto
- El archivo `app.ts` (componente raíz, solo si está en la lista)

NO leas todos los archivos. Verifica la muestra representativa.

## Checklist (máximo 3 toolcalls)

Realiza solo **3 verificaciones** en total, eligiendo las más relevantes según el tipo de cambio:

### Si hay componentes nuevos:
1. `grep -rn "styleUrls" src/app/` → debe dar 0 (usar `styleUrl` singular)
2. En el `.ts` del componente: verificar que usa `output()`, `viewChild()`, `afterNextRender()` (no `querySelector`, no `@Input`/`@Output`)
3. Verificar que los imports apuntan a archivos que existen: `grep "export.*Servicio" src/app/**/servicio.service.ts`

### Si hay servicios nuevos:
1. `@Injectable({ providedIn: 'root' })` presente
2. `signal<T>()` o `computed()` para estado reactivo
3. Métodos públicos con firma tipada

### Si hay `app.ts` modificado:
1. `imports` del decorador incluye todos los componentes standalone
2. Template incluye `@if` para navegación entre pantallas

### Si hay tests E2E o archivos de configuración:
1. Verificar que `playwright.config.ts` tiene `webServer`: `grep -q "webServer" playwright.config.ts`
2. Si falta → incluir en el handoff a code-writer como corrección

## Acción correctiva

- **Todo OK** → handoff a qa-validator: `/tmp/handoff/[session_id]/qa-validator[HHMMSS]/tarea1.json`
  `{"tipo": "test", "contenido": {"archivos_verificados": [...]}}`
- **Bugs** → handoff a code-writer: `/tmp/handoff/[session_id]/code-writer[HHMMSS]/tareaN.json`
  con tipo `"correccion"` y descripción exacta del bug (archivo, línea, esperado vs actual)
- **Max toolcalls alcanzado** → responde ✅ con "Verificación parcial por límite de toolcalls"
