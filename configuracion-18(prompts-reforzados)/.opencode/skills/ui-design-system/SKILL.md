---
name: ui-design-system
description: Sistema de diseño visual (colores, tipografía, espaciado, librería activa)
---

# Skill: ui-design-system

# Sistema de Diseño — Dinosaur Runner (Dark Neon)

## Propósito
Esta skill define la identidad visual y los patrones de UI del proyecto Dinosaur Runner.
La carga **siempre** el agente `ui-designer` al iniciar una tarea de diseño.
code-writer también la consulta para garantizar consistencia en la implementación.

---

## 1. Librería de Componentes Activa

| Estado | Librería | Versión mínima | Documentación |
|--------|----------|----------------|---------------|
| ❌ No aplica | Canvas 2D + DOM overlays | — | — |

> **Nota:** Este proyecto usa Canvas 2D API para el juego + DOM nativo para menús y HUD.
> No requiere PrimeNG, Angular Material ni ninguna librería de componentes UI.

---

## 2. Paleta de Colores — Dark Neon

Los fondos son oscuros. Los botones, textos y elementos clave usan colores neón vibrantes.

### Fondos

| Token | Uso | Hex | CSS Variable |
|-------|-----|-----|--------------|
| `--bg-primary` | Fondo principal de pantallas | `#0a0a0f` | `--bg-primary` |
| `--bg-secondary` | Fondo de tarjetas, paneles | `#14141f` | `--bg-secondary` |
| `--bg-tertiary` | Fondo de inputs, áreas de juego | `#1a1a2e` | `--bg-tertiary` |
| `--bg-game` | Fondo del canvas del juego | `#07070b` | `--bg-game` |

### Texto

| Token | Uso | Hex | CSS Variable |
|-------|-----|-----|--------------|
| `--text-primary` | Texto principal | `#f0f0f0` | `--text-primary` |
| `--text-secondary` | Texto secundario, etiquetas | `#a0a0b0` | `--text-secondary` |
| `--text-muted` | Texto deshabilitado, hints | `#606070` | `--text-muted` |

### Colores Neón (acento)

| Token | Uso | Hex | CSS Variable |
|-------|-----|-----|--------------|
| `--neon-cyan` | Acento primario, botones principales | `#00f0ff` | `--neon-cyan` |
| `--neon-magenta` | Acento secundario, hover states | `#ff00aa` | `--neon-magenta` |
| `--neon-green` | Dinosaurio, éxito, vidas | `#39ff14` | `--neon-green` |
| `--neon-red` | Obstáculos, peligro, game over | `#ff1744` | `--neon-red` |
| `--neon-yellow` | Puntuación, monedas, estrellas | `#ffe600` | `--neon-yellow` |
| `--neon-purple` | Power-ups, bonus | `#bb00ff` | `--neon-purple` |

### Superficies interactivas

| Token | Uso | Hex | CSS Variable |
|-------|-----|-----|--------------|
| `--surface-button` | Fondo de botón normal | `#1e1e32` | `--surface-button` |
| `--surface-button-hover` | Fondo de botón hover | `#2a2a45` | `--surface-button-hover` |
| `--surface-card` | Fondo de tarjetas | `#14141f` | `--surface-card` |
| `--surface-overlay` | Fondo de modales/overlays | `#0d0d16e0` | `--surface-overlay` |

---

## 3. Tipografía

| Propiedad | Valor |
|-----------|-------|
| Fuente base | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |
| Fuente para puntuación/títulos juego | `'Press Start 2P', monospace` (cargar desde Google Fonts) |
| Tamaño base | `16px` |
| Escala | 1.25 (mayor: 20, 25, 31, 39, 49; menor: 14, 12, 10) |
| Pesos disponibles | 300 (light), 400 (regular), 600 (semibold), 700 (bold) |

### Uso por contexto

| Elemento | Fuente | Tamaño | Peso |
|----------|--------|--------|------|
| Título de pantalla (menú) | Inter | `2rem` (32px) | 700 |
| Puntuación en juego | Press Start 2P | `1.5rem` (24px) | 400 |
| Botones | Inter | `1rem` (16px) | 600 |
| Game Over texto | Press Start 2P | `2.5rem` (40px) | 400 |
| Instrucciones / tutorial | Inter | `0.875rem` (14px) | 400 |
| Créditos / versión | Inter | `0.75rem` (12px) | 300 |

---

## 4. Espaciado

| Token | Valor | Uso típico |
|-------|-------|-----------|
| `--space-xs` | `4px` | Padding interno mínimo |
| `--space-sm` | `8px` | Entre elementos cercanos |
| `--space-md` | `16px` | Espaciado estándar entre componentes |
| `--space-lg` | `24px` | Separación de secciones |
| `--space-xl` | `40px` | Margen grande, padding de pantalla |
| `--space-2xl` | `64px` | Separación de pantallas |

---

## 5. Breakpoints Responsive

| Nombre | Ancho mínimo | Target |
|--------|-------------|--------|
| `xs` | `320px` | Móviles pequeños |
| `sm` | `480px` | Móviles grandes |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Escritorio |
| `xl` | `1440px` | Escritorio grande |

> El canvas del juego se escala proporcionalmente. El breakpoint crítico es `md` (768px) donde el layout pasa de vertical a horizontal.

---

## 6. Efecto Neón — Especificación CSS

### 6.1 Glow básico (para texto y bordes)

```css
.neon-glow-cyan {
  text-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff;
}
.neon-glow-green {
  text-shadow: 0 0 7px #39ff14, 0 0 10px #39ff14, 0 0 21px #39ff14;
}
.neon-glow-red {
  text-shadow: 0 0 7px #ff1744, 0 0 10px #ff1744, 0 0 21px #ff1744;
}
```

### 6.2 Glow para bordes (botones, tarjetas)

```css
.neon-border-cyan {
  box-shadow: 0 0 5px #00f0ff, 0 0 10px #00f0ff40, inset 0 0 5px #00f0ff20;
  border: 1px solid #00f0ff;
}
```

### 6.3 Animación de parpadeo neón (opcional para énfasis)

```css
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
    opacity: 1;
  }
  20%, 24%, 55% {
    opacity: 0.6;
  }
}
.neon-flicker {
  animation: neon-flicker 1.5s infinite alternate;
}
```

### 6.4 Aplicación por elemento del juego

| Elemento | Efecto Neón | Color |
|----------|-------------|-------|
| Dinosaurio (player) | `box-shadow` + `text-shadow` externo | `--neon-green` (#39ff14) |
| Obstáculos | `box-shadow` externo pulsante | `--neon-red` (#ff1744) |
| Puntuación | `text-shadow` glow | `--neon-yellow` (#ffe600) |
| Power-ups | `box-shadow` + animación rotación | `--neon-purple` (#bb00ff) |
| Botón primario | `border` + `box-shadow` | `--neon-cyan` (#00f0ff) |
| Botón hover | Intensificar glow + `--neon-magenta` | `--neon-magenta` (#ff00aa) |

---

## 7. Patrones de Layout

| Patrón | Descripción | Aplica a |
|--------|-------------|----------|
| `game-canvas` | Canvas centrado a lo alto y a lo ancho, fondo `--bg-game`, ocupa el 90% del ancho disponible | Pantalla de juego |
| `menu-center` | Contenido centrado vertical y horizontalmente, fondo `--bg-primary` | Menú principal, Game Over |
| `hud-overlay` | HUD superpuesto sobre el canvas, posición absoluta arriba | Puntuación, vidas durante el juego |
| `dialog-modal` | Modal centrado con overlay semitransparente `--surface-overlay` | Ajustes, pausa, game over |
| `button-row` | Botones en fila horizontal centrados con gap `--space-md` | Menús, pantallas de fin |

---

## 8. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componentes standalone | `NombreComponente` | `GameCanvasComponent`, `MenuScreenComponent` |
| CSS classes | `nombre-clase` | `game-canvas`, `neon-border-cyan` |
| CSS Variables | `--nombre-variable` | `--bg-primary`, `--neon-green` |
| Signals públicas | `nombreSignal` | `scoreSignal`, `isRunningSignal` |
| Inputs Angular | `nombreInput` | `gameStateInput`, `playerNameInput` |
| Outputs Angular | `nombreChange` | `scoreChange`, `gameOverChange` |

---

## 9. Proceso de Decisión del ui-designer

Cuando ui-designer recibe una tarea de diseño:

1. Carga esta skill `ui-design-system`
2. Identifica el tipo de pantalla (menú, juego, HUD, modal)
3. Consulta la paleta de colores y asigna tokens según el propósito
4. Si requiere componentes de librería externa:
   - Si la sección `1. Librería de Componentes Activa` está pendiente: investiga con webfetch (PrimeNG, Angular Material, etc.)
   - Verifica instalación con @package-manager
   - Si ya está definida: consulta documentación oficial del componente específico
5. Para elementos del juego: aplica las especificaciones de efecto neón (sección 6)
6. Produce especificación completa (template, TS, SCSS) y delega a @code-writer
7. Si @code-writer falla por spec incompleta: refinar y re-delegar (máx 1 iteración)

---

## 10. Notas de Implementación

- Los componentes son **standalone** por defecto (Angular 21)
- Se usa `styleUrl` en lugar de `styles` (inline) o `styleUrls` (array)
- Las variables CSS globales se definen en `src/styles.scss`
- Los estilos específicos de componente van en su propio archivo `*.component.scss`
- Se prefiere signals sobre BehaviorSubject para estado de UI
- Los formularios usan reactivos (ReactiveFormsModule)
- El canvas del juego se renderiza con Canvas 2D API (no librería externa)
- Los efectos neón en canvas se logran con `shadowColor` + `shadowBlur` del contexto 2D

### 10.1 Implementación de neón en Canvas 2D

Para el dinosaurio y obstáculos dentro del canvas (no DOM):

```typescript
// Ejemplo: dibujar con efecto neón en Canvas
ctx.shadowColor = '#39ff14';  // o el color neón correspondiente
ctx.shadowBlur = 15;           // intensidad del glow
ctx.fillStyle = '#39ff14';
ctx.fillRect(x, y, width, height);
// Reset para el próximo draw
ctx.shadowBlur = 0;
```

---

## 11. Referencias de Diseño

| Recurso | URL | Propósito |
|---------|-----|-----------|
| Wix Fitness Event Template | https://es.wix.com/website-template/view/html/3659 | Referencia de estilo dark + colores vibrantes |
| Google Fonts - Press Start 2P | https://fonts.google.com/specimen/Press+Start+2P | Tipografía para puntuación y títulos del juego |
| Google Fonts - Inter | https://fonts.google.com/specimen/Inter | Tipografía para UI general |

---

## 12. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-06-02 | Versión inicial: tema dark neón basado en referencias de usuario + Wix fitness template | Orquestador |