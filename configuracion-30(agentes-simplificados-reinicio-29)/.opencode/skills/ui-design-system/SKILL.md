---
name: ui-design-system
description: Sistema de diseno visual Dark Neon para Dinosaur Runner
---

# Sistema de Diseno - Dinosaur Runner (Dark Neon)

## 1. Libreria de Componentes

Este proyecto usa Canvas 2D API para el juego + DOM nativo para menus y HUD.
No requiere PrimeNG, Angular Material ni ninguna libreria de componentes UI.

## 2. Paleta de Colores - Dark Neon

### Fondos
| Token | Uso | Hex |
|-------|-----|-----|
| `--bg-primary` | Fondo principal de pantallas | `#0a0a0f` |
| `--bg-secondary` | Fondo de tarjetas, paneles | `#14141f` |
| `--bg-tertiary` | Fondo de inputs, areas de juego | `#1a1a2e` |
| `--bg-game` | Fondo del canvas del juego | `#07070b` |

### Texto
| Token | Uso | Hex |
|-------|-----|-----|
| `--text-primary` | Texto principal | `#f0f0f0` |
| `--text-secondary` | Texto secundario, etiquetas | `#a0a0b0` |
| `--text-muted` | Texto deshabilitado, hints | `#606070` |

### Colores Neon (acento)
| Token | Uso | Hex |
|-------|-----|-----|
| `--neon-cyan` | Acento primario, botones principales | `#00f0ff` |
| `--neon-magenta` | Acento secundario, hover states | `#ff00aa` |
| `--neon-green` | Dinosaurio, exito, vidas | `#39ff14` |
| `--neon-red` | Obstaculos, peligro, game over | `#ff1744` |
| `--neon-yellow` | Puntuacion, monedas, estrellas | `#ffe600` |
| `--neon-purple` | Power-ups, bonus | `#bb00ff` |

### Superficies interactivas
| Token | Uso | Hex |
|-------|-----|-----|
| `--surface-button` | Fondo de boton normal | `#1e1e32` |
| `--surface-button-hover` | Fondo de boton hover | `#2a2a45` |
| `--surface-card` | Fondo de tarjetas | `#14141f` |
| `--surface-overlay` | Fondo de modales/overlays | `#0d0d16e0` |

## 3. Tipografia

- Fuente base: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Fuente juego/puntuacion: `'Press Start 2P', monospace` (Google Fonts)
- Tamano base: `16px`, escala 1.25

| Elemento | Fuente | Tamano | Peso |
|----------|--------|--------|------|
| Titulo de pantalla (menu) | Inter | 2rem (32px) | 700 |
| Puntuacion en juego | Press Start 2P | 1.5rem (24px) | 400 |
| Botones | Inter | 1rem (16px) | 600 |
| Game Over texto | Press Start 2P | 2.5rem (40px) | 400 |

## 4. Espaciado

| Token | Valor | Uso tipico |
|-------|-------|-----------|
| `--space-xs` | 4px | Padding interno minimo |
| `--space-sm` | 8px | Entre elementos cercanos |
| `--space-md` | 16px | Espaciado estandar entre componentes |
| `--space-lg` | 24px | Separacion de secciones |
| `--space-xl` | 40px | Margen grande, padding de pantalla |
| `--space-2xl` | 64px | Separacion de pantallas |

## 5. Efecto Neon - CSS

### Glow basico (texto y bordes)
```css
.neon-glow-cyan  { text-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff; }
.neon-glow-green { text-shadow: 0 0 7px #39ff14, 0 0 10px #39ff14, 0 0 21px #39ff14; }
.neon-glow-red   { text-shadow: 0 0 7px #ff1744, 0 0 10px #ff1744, 0 0 21px #ff1744; }
```

### Glow para bordes
```css
.neon-border-cyan {
  box-shadow: 0 0 5px #00f0ff, 0 0 10px #00f0ff40, inset 0 0 5px #00f0ff20;
  border: 1px solid #00f0ff;
}
```

### Animacion parpadeo
```css
@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.6; }
}
.neon-flicker { animation: neon-flicker 1.5s infinite alternate; }
```

### Aplicacion por elemento
| Elemento | Efecto | Color |
|----------|--------|-------|
| Dinosaurio | box-shadow + text-shadow externo | --neon-green |
| Obstaculos | box-shadow pulsante | --neon-red |
| Puntuacion | text-shadow glow | --neon-yellow |
| Power-ups | box-shadow + animacion | --neon-purple |
| Boton primario | border + box-shadow | --neon-cyan |
| Boton hover | Intensificar glow | --neon-magenta |

## 6. Patrones de Layout

| Patron | Descripcion |
|--------|-------------|
| `game-canvas` | Canvas centrado, fondo --bg-game, 90% ancho disponible |
| `menu-center` | Contenido centrado vertical y horizontalmente, fondo --bg-primary |
| `hud-overlay` | HUD superpuesto sobre el canvas, posicion absoluta arriba |
| `dialog-modal` | Modal centrado con overlay semitransparente --surface-overlay |
| `button-row` | Botones en fila horizontal centrados con gap --space-md |

## 7. Notas de Implementacion

- Componentes standalone (Angular v{ANGULAR_VERSION}) con `styleUrl`
- Variables CSS globales en `src/styles.scss`
- Canvas 2D API (no libreria externa)
- Efectos neon en canvas con `shadowColor` + `shadowBlur`:
  ```typescript
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#39ff14';
  ctx.fillRect(x, y, width, height);
  ctx.shadowBlur = 0; // reset
  ```
