# SKILL: game-loop-patterns

## Propósito
Establecer patrones correctos para bucles de juegos en Angular con Canvas, evitando errores de timing, coordenadas y física.

## ¿Cuándo usarla?
Siempre que un proyecto implemente un game loop con requestAnimationFrame, canvas o lógica de tiempo real.

## Reglas de Timing

### Regla 1: deltaTime es OBLIGATORIO
El game loop DEBE calcular y usar deltaTime para todas las actualizaciones:
```typescript
private gameLoop(timestamp: number): void {
    if (this.lastTime === 0) this.lastTime = timestamp;
    const deltaTime = (timestamp - this.lastTime) / 16.67;
    this.lastTime = timestamp;
    
    if (estado === 'playing') {
        servicio.updateGameLoop(deltaTime);
    }
    
    this.render();
    this.animationFrameId = requestAnimationFrame(t => this.gameLoop(t));
}
```

### Regla 2: deltaTime DEBE pasarse a los métodos de actualización
❌ `updateGameLoop()` — sin parámetros (asume 60fps)
✅ `updateGameLoop(deltaTime: number)` — frame-rate independent

### Regla 3: Incremento de score
❌ `score += 1` (cada frame = 60 puntos/segundo — irreal)
✅ `score += 0.15 * deltaTime` (~9 puntos/segundo como el juego de Chrome)

### Regla 4: Incremento de velocidad
❌ `speed += 0.5` (cada frame = +30/segundo — injugable en 2 segundos)
✅ `speed += 0.008 * deltaTime` (~+0.48/segundo, con máximo 20)

### Regla 5: Generación de obstáculos
❌ Generar obstáculos sin control de distancia
✅ Solo generar si el último obstáculo está lo suficientemente lejos:
```typescript
const lastObstacle = obstacles[obstacles.length - 1];
const shouldGenerate = !lastObstacle || lastObstacle.x < 600;
if (shouldGenerate && Math.random() < 0.02) {
    this.addObstacle();
}
```

## Reglas de Canvas

### Regla 6: Dimensiones del canvas
SIEMPRE establecer width y height explícitamente:
```typescript
canvas.width = 800;
canvas.height = 200;
```

### Regla 7: Coordenadas Y en Canvas
En el sistema de coordenadas del canvas, `y` representa la PARTE SUPERIOR de las figuras.

Para posicionar un elemento SOBRE el suelo:
```typescript
// Correcto: la BASE del dino toca el suelo
dino.y = groundY - dino.height;  // ej: 150 - 50 = 100
// El dino ocupa de y=100 a y=150, el suelo está en y=150

// Incorrecto: el dino aparece DEBAJO del suelo
dino.y = groundY;  // ej: 150 — el dino va de y=150 a y=200
```

Para detectar colisión con el suelo:
```typescript
// Correcto: la base del dino toca el suelo
if (dino.y + dino.height >= groundY) { /* colisión */ }

// Incorrecto: solo verifica la parte superior
if (dino.y >= groundY) { /* el dino ya está medio enterrado */ }
```

### Regla 8: Inicialización del canvas
Usar afterNextRender + ViewChild:
```typescript
@ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

constructor() {
    afterNextRender(() => {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = 800;
        canvas.height = 200;
        this.ctx = canvas.getContext('2d');
        this.gameLoop(0);
        this.setupEventListeners();
    });
}
```

## Anti-patrones

❌ Game loop sin deltaTime — la velocidad depende de la tasa de refresco
❌ `increaseSpeed()` llamado sin control de frecuencia
❌ `updateScore()` sumando 1 por frame
❌ Dino posicionado con `y = groundY` en vez de `y = groundY - height`
❌ Canvas sin width/height explícitos
