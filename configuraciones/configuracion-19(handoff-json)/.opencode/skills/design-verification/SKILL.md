---
name: design-verification
description: Verifica que los componentes implementados cumplan con las especificaciones de ui-design-system (colores, fuentes, efectos neon, espaciado).
---

# Design Verification — Dinosaur Runner

## Objetivo
Verificar que los componentes HTML/SCSS implementados coincidan con las especificaciones visuales definidas en `ui-design-system`.

## Cuándo usarla
Debe cargarla @verifier DESPUÉS de que code-writer complete un lote de componentes visuales (welcome-screen, game-board, game-over, menús, HUD).

## Cómo usarla

### Paso 1: Identificar los archivos SCSS modificados
Usar glob para encontrar los archivos `.component.scss` del lote actual.

### Paso 2: Verificar uso de variables CSS (OBLIGATORIO)
Para cada archivo SCSS, verificar que NO contenga colores hex hardcodeados que DEBERÍAN ser variables del design system.

**Excepciones permitidas (colores que pueden ser hardcodeados):**
- Colores dentro de Canvas 2D (ctx.fillStyle, ctx.strokeStyle) — el canvas usa shadowColor/shadowBlur
- Gradientes específicos no definidos en el design system
- Colores de animaciones keyframe

**Regla:** Si existe `#` seguido de 3 o 6 dígitos hex FUERA de un contexto Canvas 2D, debe ser una variable CSS `var(--...)`.

Excepciones:
- `#000` y `#fff` o `#ffffff` (blanco y negro básicos)
- Colores dentro de strings de canvas (`ctx.fillStyle = '#39ff14'`)
- Animaciones `@keyframes`

### Paso 3: Verificar fuente tipográfica
Para cada archivo SCSS, verificar que:
- `font-family` incluya `'Inter'` o `'Press Start 2P'` según el contexto
- No use fuentes genéricas serif donde debería usar Inter

### Paso 4: Verificar efectos neon (donde aplica)
Para componentes que tengan botones o elementos interactivos:
- Deben usar `box-shadow` con colores neon o `var(--neon-*)`
- Deben usar `border: 1px solid` con color neon

### Paso 5: Verificar espaciado
- Los márgenes/paddings deben usar `var(--space-*)` o valores consistentes con la escala (4, 8, 16, 24, 40, 64px)

## Formato de reporte

```
🔍 VERIFICACIÓN DE DISEÑO
Archivos revisados: [lista]
CSS variables: ✅ Usa var(--neon-*) correctamente | ❌ Hex hardcodeado: [línea]
Fuentes: ✅ Inter/Press Start 2P | ❌ Fuente incorrecta: [detalle]
Neon effects: ✅ Presentes | ❌ Faltantes: [detalle]
Espaciado: ✅ Usa escala del design system | ❌ Inconsistencias: [detalle]
```

## Checklist de verificación

- [ ] ¿Los colores en SCSS usan `var(--nombre)` en lugar de hex hardcodeados?
- [ ] ¿Las fuentes son 'Inter' o 'Press Start 2P' según el contexto?
- [ ] ¿Los botones tienen efecto neon (box-shadow + border)?
- [ ] ¿El espaciado sigue la escala del design system (4, 8, 16, 24, 40, 64)?
- [ ] ¿El componente :host tiene display: block?

## Integración con @verifier

Cuando @verifier detecte que el lote incluye archivos `.component.scss`:
1. Cargar `design-verification`
2. Ejecutar pasos 2-5
3. Reportar hallazgos
4. Si hay fallos de diseño → delegar a @code-writer para corrección
5. Máx 1 iteración de corrección de diseño
```