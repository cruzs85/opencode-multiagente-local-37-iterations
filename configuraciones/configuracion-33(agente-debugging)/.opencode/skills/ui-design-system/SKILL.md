---
name: ui-design-system
description: Sistema de diseno visual Dark Neon para videojuegos Angular
---

# Sistema de Diseno Dark Neon

## Libreria
Usar Canvas 2D API para el juego + DOM nativo para menus y HUD.
No requiere PrimeNG, Angular Material ni librerias UI externas.

## Paleta de Colores

### Fondos
| Variable | Uso | Hex |
|----------|-----|-----|
| `--bg-primary` | Fondo principal | `#0a0a0f` |
| `--bg-secondary` | Tarjetas, paneles | `#14141f` |
| `--bg-tertiary` | Inputs, area de juego | `#1a1a2e` |
| `--bg-game` | Canvas del juego | `#07070b` |

### Texto
| Variable | Uso | Hex |
|----------|-----|-----|
| `--text-primary` | Principal | `#f0f0f0` |
| `--text-secondary` | Secundario | `#a0a0b0` |
| `--text-muted` | Deshabilitado | `#606070` |

### Colores Neon (acento)
| Variable | Uso | Hex |
|----------|-----|-----|
| `--neon-cyan` | Botones principales | `#00f0ff` |
| `--neon-magenta` | Hover states | `#ff00aa` |
| `--neon-green` | Dinosaurio, exito | `#39ff14` |
| `--neon-red` | Obstaculos, game over | `#ff1744` |
| `--neon-yellow` | Puntuacion | `#ffe600` |
| `--neon-purple` | Power-ups | `#bb00ff` |

### Superficies interactivas
| Variable | Uso | Hex |
|----------|-----|-----|
| `--surface-button` | Boton normal | `#1e1e32` |
| `--surface-button-hover` | Boton hover | `#2a2a45` |
| `--surface-overlay` | Modales/overlays | `#0d0d16e0` |

## Tipografia
- Base: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- Juego/puntuacion: `'Press Start 2P', monospace` (Google Fonts)
- Tamano base `16px`, escala 1.25

| Elemento | Fuente | Tamano | Peso |
|----------|--------|--------|------|
| Titulo menu | Inter | 2rem | 700 |
| Puntuacion juego | Press Start 2P | 1.5rem | 400 |
| Botones | Inter | 1rem | 600 |
| Game Over | Press Start 2P | 2.5rem | 400 |

## Efecto Neon - CSS
```css
.neon-glow-cyan  { text-shadow: 0 0 7px #00f0ff, 0 0 10px #00f0ff, 0 0 21px #00f0ff; }
.neon-glow-green { text-shadow: 0 0 7px #39ff14, 0 0 10px #39ff14, 0 0 21px #39ff14; }
.neon-glow-red   { text-shadow: 0 0 7px #ff1744, 0 0 10px #ff1744, 0 0 21px #ff1744; }

.neon-border-cyan {
  box-shadow: 0 0 5px #00f0ff, 0 0 10px #00f0ff40, inset 0 0 5px #00f0ff20;
  border: 1px solid #00f0ff;
}

@keyframes neon-flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
  20%, 24%, 55% { opacity: 0.6; }
}
.neon-flicker { animation: neon-flicker 1.5s infinite alternate; }
```

### Efectos neon en Canvas
```typescript
ctx.shadowColor = '#39ff14';
ctx.shadowBlur = 15;
ctx.fillStyle = '#39ff14';
ctx.fillRect(x, y, width, height);
ctx.shadowBlur = 0;
```

## Patrones de Layout
- `game-canvas`: Canvas centrado, fondo --bg-game
- `menu-center`: Contenido centrado vertical/horizontal
- `hud-overlay`: HUD superpuesto sobre canvas, posicion absoluta
- `dialog-modal`: Modal centrado con overlay semitransparente
- `button-row`: Botones en fila horizontal centrados con gap
