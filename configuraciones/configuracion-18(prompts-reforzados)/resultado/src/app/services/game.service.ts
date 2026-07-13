import { Injectable, signal, DestroyRef, inject } from '@angular/core';

export interface Dino {
  x: number; y: number; width: number; height: number;
  vy: number; onGround: boolean; jumps: number;
}

export interface Obstacle {
  x: number; y: number; width: number; height: number;
  type: 'cactus-small' | 'cactus-large' | 'cactus-group';
}

@Injectable({ providedIn: 'root' })
export class GameService {
  score = signal<number>(0);
  highScore = signal<number>(0);
  isRunning = signal<boolean>(false);
  isGameOver = signal<boolean>(false);
  speed = signal<number>(5);
  dino = signal<Dino>({ x: 50, y: 0, width: 30, height: 40, vy: 0, onGround: true, jumps: 0 });
  obstacles = signal<Obstacle[]>([]);

  readonly GRAVITY = 0.6;
  readonly JUMP_FORCE = -12;
  readonly MAX_JUMPS = 2;
  readonly BASE_SPEED = 5;
  readonly SPEED_INCREMENT = 0.001;
  readonly MAX_SPEED = 15;
  readonly GROUND_OFFSET = 50;
  readonly SPAWN_INTERVAL_MIN = 90;
  readonly SPAWN_INTERVAL_MAX = 180;
  readonly CANVAS_WIDTH = 800;
  readonly CANVAS_HEIGHT = 400;

  private animationFrameId = 0;
  private lastTime = 0;
  private spawnTimer = 0;
  private nextSpawnIn = 120;
  private destroyRef = inject(DestroyRef);

  constructor() {
    const saved = localStorage.getItem('dinoHighScore');
    if (saved) { this.highScore.set(parseInt(saved, 10)); }
    this.destroyRef.onDestroy(() => this.stopLoop());
  }

  startGame() {
    this.score.set(0);
    this.speed.set(this.BASE_SPEED);
    this.isGameOver.set(false);
    this.obstacles.set([]);
    this.spawnTimer = 0;
    this.nextSpawnIn = this.getRandomSpawnInterval();
    const groundY = this.CANVAS_HEIGHT - this.GROUND_OFFSET;
    this.dino.set({ x: 50, y: groundY - 40, width: 30, height: 40, vy: 0, onGround: true, jumps: 0 });
    this.isRunning.set(true);
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  stopGame() { this.isRunning.set(false); this.stopLoop(); }

  private stopLoop() {
    if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = 0; }
  }

  jump() {
    const d = this.dino();
    if (d.jumps < this.MAX_JUMPS) {
      this.dino.update(dino => ({ ...dino, vy: this.JUMP_FORCE, onGround: false, jumps: dino.jumps + 1 }));
    }
  }

  private gameLoop(timestamp: number) {
    if (!this.isRunning()) return;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.update(deltaTime);
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  private update(deltaTime: number) {
    const dt = Math.min(deltaTime / 16.67, 3);
    const groundY = this.CANVAS_HEIGHT - this.GROUND_OFFSET;
    this.dino.update(d => {
      let newY = d.y + d.vy * dt;
      let newVy = d.vy + this.GRAVITY * dt;
      let onGround = false;
      let jumps = d.jumps;
      if (newY >= groundY - d.height) { newY = groundY - d.height; newVy = 0; onGround = true; jumps = 0; }
      return { ...d, y: newY, vy: newVy, onGround, jumps };
    });
    this.obstacles.update(obs => obs.map(o => ({ ...o, x: o.x - this.speed() * dt })).filter(o => o.x + o.width > 0));
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.nextSpawnIn) {
      this.spawnTimer = 0;
      this.nextSpawnIn = this.getRandomSpawnInterval();
      this.spawnObstacle();
    }
    this.speed.update(s => Math.min(s + this.SPEED_INCREMENT * dt, this.MAX_SPEED));
    this.score.update(s => s + 0.1 * dt);
    if (this.checkCollision()) { this.gameOver(); }
  }

  private spawnObstacle() {
    const groundY = this.CANVAS_HEIGHT - this.GROUND_OFFSET;
    const types: Obstacle['type'][] = ['cactus-small', 'cactus-large', 'cactus-group'];
    const type = types[Math.floor(Math.random() * types.length)];
    let width = 20, height = 40;
    switch (type) {
      case 'cactus-small': width = 20 + Math.random() * 10; height = 30 + Math.random() * 15; break;
      case 'cactus-large': width = 25 + Math.random() * 15; height = 45 + Math.random() * 20; break;
      case 'cactus-group': width = 40 + Math.random() * 30; height = 35 + Math.random() * 15; break;
    }
    this.obstacles.update(obs => [...obs, { x: this.CANVAS_WIDTH + 50, y: groundY - height, width, height, type }]);
  }

  private getRandomSpawnInterval(): number {
    return this.SPAWN_INTERVAL_MIN + Math.random() * (this.SPAWN_INTERVAL_MAX - this.SPAWN_INTERVAL_MIN);
  }

  private checkCollision(): boolean {
    const d = this.dino();
    const pad = 4;
    const dLeft = d.x + pad, dRight = d.x + d.width - pad;
    const dTop = d.y + pad, dBottom = d.y + d.height - pad;
    return this.obstacles().some(o => {
      const oLeft = o.x + 2, oRight = o.x + o.width - 2;
      const oTop = o.y + 2, oBottom = o.y + o.height - 2;
      return dLeft < oRight && dRight > oLeft && dTop < oBottom && dBottom > oTop;
    });
  }

  private gameOver() {
    this.isRunning.set(false);
    this.isGameOver.set(true);
    this.stopLoop();
    const currentScore = Math.floor(this.score());
    if (currentScore > this.highScore()) { this.highScore.set(currentScore); localStorage.setItem('dinoHighScore', String(currentScore)); }
  }

  resetGame() { this.isGameOver.set(false); this.startGame(); }
}