import { Component, inject, afterNextRender, DestroyRef, NgZone, effect, Injector, signal } from '@angular/core';
import { GameService, Obstacle, Cloud } from '../core/services/game.service';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [],
  templateUrl: './game-canvas.component.html',
  styleUrl: './game-canvas.component.scss'
})
export class GameCanvasComponent {
  private gameService = inject(GameService)
  private destroyRef = inject(DestroyRef)
  private ngZone = inject(NgZone)

  // Propiedades públicas para bindear al template
  readonly state = this.gameService.state
  readonly score = this.gameService.score
  readonly dino = this.gameService.dino
  readonly obstacles = this.gameService.obstacles
  readonly velocity = this.gameService.velocity
  readonly groundOffset = this.gameService.groundOffset
  readonly clouds = this.gameService.clouds

  // Canvas y contexto
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private dinoImage: HTMLImageElement = new Image()
  private dinoOffscreen!: HTMLCanvasElement
  private dinoOffscreenCtx!: CanvasRenderingContext2D
  private readonly ZOOM_FACTOR = 2.0

  // Signal para el score display
  private readonly _displayScore = signal(0)
  readonly displayScore = this._displayScore.asReadonly()

  constructor() {
    // afterNextRender para acceder al canvas del DOM
    afterNextRender(() => {
      const img = new Image()
      this.dinoImage = img
      img.src = 'assets/dino/Dino.gif'
      img.onload = () => {
        console.log('Dino image loaded successfully')
      }
      img.onerror = () => {
        console.log('Error loading Dino image')
      }

      // Forzar animación del GIF añadiendo el img al DOM fuera de pantalla
      img.style.position = 'fixed'
      img.style.visibility = 'hidden'
      img.style.left = '-9999px'
      img.style.top = '-9999px'
      img.style.pointerEvents = 'none'
      document.body.appendChild(img)

      // Crear el canvas offscreen para chroma key
      this.dinoOffscreen = document.createElement('canvas')
      this.dinoOffscreen.width = 56
      this.dinoOffscreen.height = 70
      this.dinoOffscreenCtx = this.dinoOffscreen.getContext('2d')!
      this.dinoOffscreenCtx.imageSmoothingEnabled = false

      this.canvas = document.querySelector('#gameCanvas') as HTMLCanvasElement
      this.ctx = this.canvas.getContext('2d')!
      this.canvas.width = 800
      this.canvas.height = 300

      // Iniciar el game loop de renderizado (fuera de NgZone para rendimiento)
      this.ngZone.runOutsideAngular(() => {
        this.renderLoop()
      })
    })

    // Efecto para actualizar score display
    effect(() => {
      this._displayScore.set(Math.floor(this.gameService.score()))
    }, { injector: inject(Injector) })

    // Eliminar el img del DOM al destruir el componente
    this.destroyRef.onDestroy(() => {
      if (document.body.contains(this.dinoImage)) {
        document.body.removeChild(this.dinoImage)
      }
    })
  }

  // Método privado renderLoop(): bucle de renderizado con requestAnimationFrame
  // 1. Limpiar canvas
  // 2. Dibujar cielo (gradiente azul claro)
  // 2b. Dibujar nubes
  // 3. Dibujar suelo
  // 4. Dibujar obstáculos (rectángulos verdes tipo cactus)
  // 5. Dibujar dinosaurio (rectángulo con animación de 2 frames - diferente altura/forma)
  // 6. Dibujar puntuación en esquina superior derecha
  // Condición: solo dibujar si state() === 'playing', si no, esperar
  private renderLoop(): void {
    if (this.gameService.state() === 'playing') {
      // 1. Limpiar canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      
      // 2. Dibujar cielo (gradiente azul claro)
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#E0F7FA')
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      
      // 2b. Dibujar nubes
      for (const cloud of this.gameService.clouds()) {
        this.drawCloud(cloud)
      }
      
      // 3. Dibujar suelo
      this.drawGround(this.gameService.groundOffset())
      
      // 4. Dibujar obstáculos
      for (const obstacle of this.gameService.obstacles()) {
        this.drawObstacle(obstacle)
      }
      
      // 5. Dibujar dinosaurio
      this.drawDino(this.gameService.dino().y, this.gameService.dino().frame)
      
      // 6. Dibujar puntuación
      this.drawScore(this.gameService.score())
    }
    
    // Continuar el bucle solo si el estado sigue siendo 'playing'
    if (this.gameService.state() === 'playing') {
      requestAnimationFrame(() => this.renderLoop())
    }
  }

  // Método privado drawDino(y: number, frame: number): void
  // - Dibuja el dinosaurio en posición x=50, y
  // - frame 0: rectángulo más alto (corriendo con piernas estiradas)
  // - frame 1: rectángulo más compacto (corriendo con piernas recogidas)
  // - Color: verde oscuro (#4a7c3f)
  // - Detalles: ojo blanco pequeño
  private drawDino(y: number, frame: number): void {
    if (this.dinoImage && this.dinoImage.complete && this.dinoImage.naturalWidth > 0) {
      // Si la imagen está cargada, dibujarla
      // Limpiar el offscreen
      this.dinoOffscreenCtx.clearRect(0, 0, 56, 70)
      
      // Escalar el GIF con zoom para eliminar bordes blancos
      const scaledWidth = 56 * this.ZOOM_FACTOR
      const scaledHeight = 70 * this.ZOOM_FACTOR
      const offsetX = -(scaledWidth - 56) / 2
      const offsetY = -(scaledHeight - 70) / 2
      this.dinoOffscreenCtx.drawImage(this.dinoImage, offsetX, offsetY, scaledWidth, scaledHeight)
      
      // Aplicar chroma key para transparentar el blanco
      this.applyChromaKey()
      
      // Dibujar el offscreen en el canvas principal
      this.ctx.drawImage(this.dinoOffscreen, 50, y)
    } else {
      // Fallback: dibujar rectángulo verde como antes
      this.ctx.fillStyle = '#4a7c3f'
      
      if (frame === 0) {
        // Frame 0: rectángulo más alto (corriendo con piernas estiradas)
        this.ctx.fillRect(50, y, 56, 70)
      } else {
        // Frame 1: rectángulo más compacto (corriendo con piernas recogidas)
        this.ctx.fillRect(50, y, 56, 56)
      }
      
      // Dibujar ojo blanco pequeño
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(96, y + 14, 11, 11)
      
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(98, y + 16, 6, 6)
    }
  }

  // Método privado applyChromaKey(): void
  // - Aplica efecto de transparencia al blanco puro del GIF
  private applyChromaKey(): void {
    // Obtener los datos de imagen del offscreen
    const imageData = this.dinoOffscreenCtx.getImageData(0, 0, 56, 70)
    const data = imageData.data
    
    // Recorrer los píxeles en grupos de 4 (R, G, B, A)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Si el píxel es blanco puro (R > 240 Y G > 240 Y B > 240), hacerlo transparente
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0 // Establecer alpha a 0
      }
    }
    
    // Volver a poner los datos de imagen modificados
    this.dinoOffscreenCtx.putImageData(imageData, 0, 0)
  }

  // Método privado drawObstacle(obs: Obstacle): void
  // - Dibuja cactus (rectángulo verde con púas triangulares pequeñas)
  // - Color: verde (#2d5a27)
  // - Detalles: líneas horizontales para textura
  private drawObstacle(obs: Obstacle): void {
    if (obs.type === 'air') {
      // Obstáculo aéreo: pájaro/pterodáctilo
      this.drawAirObstacle(obs);
    } else {
      // Obstáculo terrestre: cactus (igual que antes)
      this.ctx.fillStyle = '#2d5a27'
      
      // Dibujar el cuerpo del cactus
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      
      // Dibujar púas triangulares
      this.ctx.fillStyle = '#1a3d1a'
      const spikeWidth = 5
      const spikeHeight = 8
      
      // Púas en la parte superior
      for (let i = 0; i < obs.width; i += 10) {
        if (i % 20 === 0) {
          this.ctx.beginPath()
          this.ctx.moveTo(obs.x + i, obs.y)
          this.ctx.lineTo(obs.x + i + spikeWidth, obs.y)
          this.ctx.lineTo(obs.x + i + spikeWidth / 2, obs.y - spikeHeight)
          this.ctx.closePath()
          this.ctx.fill()
        }
      }
      
      // Líneas horizontales para textura
      this.ctx.strokeStyle = '#1a3d1a'
      this.ctx.lineWidth = 1
      for (let i = 0; i < obs.height; i += 10) {
        this.ctx.beginPath()
        this.ctx.moveTo(obs.x, obs.y + i)
        this.ctx.lineTo(obs.x + obs.width, obs.y + i)
        this.ctx.stroke()
      }
    }
  }

  private drawAirObstacle(obs: Obstacle): void {
    // Cuerpo del pájaro (rojo oscuro)
    this.ctx.fillStyle = '#8B0000'
    this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
    
    // Ala superior (triángulo)
    this.ctx.beginPath()
    this.ctx.moveTo(obs.x, obs.y)
    this.ctx.lineTo(obs.x + obs.width / 2, obs.y - 15)
    this.ctx.lineTo(obs.x + obs.width, obs.y)
    this.ctx.closePath()
    this.ctx.fillStyle = '#A52A2A'
    this.ctx.fill()
    
    // Ala inferior (triángulo invertido)
    this.ctx.beginPath()
    this.ctx.moveTo(obs.x, obs.y + obs.height)
    this.ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height + 10)
    this.ctx.lineTo(obs.x + obs.width, obs.y + obs.height)
    this.ctx.closePath()
    this.ctx.fillStyle = '#8B0000'
    this.ctx.fill()
    
    // Ojo
    this.ctx.fillStyle = 'white'
    this.ctx.fillRect(obs.x + obs.width - 8, obs.y + 5, 5, 5)
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(obs.x + obs.width - 7, obs.y + 6, 3, 3)
  }

  // Método privado drawGround(offset: number): void
  // - Línea base marrón en y=220
  // - Pequeñas marcas de pasto con offset para efecto de movimiento
  // - Dibujar cada 20px con variación
  private drawGround(offset: number): void {
    // Línea base marrón
    this.ctx.fillStyle = '#8B4513'
    this.ctx.fillRect(0, 220, this.canvas.width, 80)
    
    // Marca de pasto con efecto de movimiento
    this.ctx.fillStyle = '#228B22'
    for (let x = -offset; x < this.canvas.width; x += 20) {
      this.ctx.fillRect(x, 220, 5, 10)
    }
  }

  private drawCloud(cloud: Cloud): void {
    const { x, y, width, opacity } = cloud
    const height = width * 0.4 // proporción altura-ancho
    
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    
    // Nube formada por 3 círculos solapados
    this.ctx.beginPath()
    this.ctx.arc(x, y + height * 0.3, width * 0.3, 0, Math.PI * 2)
    this.ctx.arc(x + width * 0.35, y, width * 0.35, 0, Math.PI * 2)
    this.ctx.arc(x + width * 0.7, y + height * 0.3, width * 0.3, 0, Math.PI * 2)
    this.ctx.fill()
  }

  // Método privado drawScore(score: number): void
  // - Texto en esquina superior derecha
  // - Fuente: 'bold 16px monospace', color blanco
  // - Sombra negra para legibilidad
  private drawScore(score: number): void {
    this.ctx.font = 'bold 16px monospace'
    this.ctx.textAlign = 'right'
    this.ctx.fillStyle = 'black'
    this.ctx.fillText(`Score: ${Math.floor(score)}`, this.canvas.width - 18, 20)
    
    this.ctx.fillStyle = 'white'
    this.ctx.fillText(`Score: ${Math.floor(score)}`, this.canvas.width - 19, 19)
  }
}
