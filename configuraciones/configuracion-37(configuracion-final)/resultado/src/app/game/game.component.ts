import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';
import { effect } from '@angular/core';

@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  gameService = inject(GameService);
  private router = inject(Router);
  
  private boundKeyDown = this.handleKeyDown.bind(this);
  private animationFrameId!: number;
  
  private stateEffect = effect(() => {
    if (this.gameService.gameState() === 'game-over') {
      this.router.navigateByUrl('/game-over');
    }
  });
  
  ngOnInit() {
    this.gameService.startGame();
    
    // Iniciar el loop de renderizado
    this.render();
    
    // Registrar listeners de eventos
    window.addEventListener('keydown', this.boundKeyDown);
    this.gameCanvas.nativeElement.addEventListener('click', this.handleCanvasClick.bind(this));
    this.gameCanvas.nativeElement.addEventListener('touchstart', this.handleCanvasTouch.bind(this));
  }

  ngOnDestroy() {
    this.gameService.stopGame();
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.boundKeyDown);
    this.gameCanvas.nativeElement.removeEventListener('click', this.handleCanvasClick.bind(this));
    this.gameCanvas.nativeElement.removeEventListener('touchstart', this.handleCanvasTouch.bind(this));
  }

  private render() {
    const canvas = this.gameCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    
    // Dibujar fondo
    ctx.fillStyle = '#07070b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar suelo
    ctx.fillStyle = '#606070';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    // Dibujar dinosaurio
    const dinoY = this.gameService.dinoY();
    const dinoX = 50;
    ctx.fillStyle = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur = 15;
    ctx.fillRect(dinoX, canvas.height - 20 - dinoY - 40, 40, 40);
    ctx.shadowBlur = 0;
    
    // Dibujar obstáculos
    ctx.fillStyle = '#ff1744';
    ctx.shadowColor = '#ff1744';
    ctx.shadowBlur = 15;
    
    for (const obstacle of this.gameService.obstacles()) {
      ctx.fillRect(obstacle.x, canvas.height - 20 - obstacle.height, obstacle.width, obstacle.height);
    }
    ctx.shadowBlur = 0;
    
    // Dibujar puntuación
    ctx.fillStyle = '#ffe600';
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.fillText(`Score: ${this.gameService.score()}`, canvas.width - 150, 30);
    
    // Continuar el loop
    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
      event.preventDefault();
      this.gameService.jump();
    }
  }

  private handleCanvasClick() {
    this.gameService.jump();
  }

  private handleCanvasTouch(event: TouchEvent) {
    event.preventDefault();
    this.gameService.jump();
  }
}