import { Injectable, signal, DestroyRef, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameTimerService {
  private readonly destroyRef = inject(DestroyRef);
  
  // Signals públicas
  readonly elapsedTime = signal<number>(0);
  readonly isRunning = signal<boolean>(false);
  
  // Estado interno
  private startTimestamp = 0;
  private accumulatedTime = 0;
  private animationFrameId: number | null = null;
  
  // Arrow function para mantener el this binding
  private readonly frameCallback = (timestamp: number) => {
    if (!this.isRunning()) return;
    
    const delta = this.startTimestamp === 0 ? 0 : timestamp - this.startTimestamp;
    this.startTimestamp = timestamp;
    this.accumulatedTime += delta;
    this.elapsedTime.set(this.accumulatedTime);
    
    this.animationFrameId = requestAnimationFrame(this.frameCallback);
  };
  
  start(): void {
    if (this.isRunning()) return;
    
    this.isRunning.set(true);
    this.startTimestamp = 0;
    this.animationFrameId = requestAnimationFrame(this.frameCallback);
  }
  
  stop(): void {
    if (!this.isRunning()) return;
    
    this.isRunning.set(false);
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  reset(): void {
    this.stop();
    this.accumulatedTime = 0;
    this.elapsedTime.set(0);
  }
  
  getElapsedSeconds(): number {
    return this.elapsedTime() / 1000;
  }
}
