
import { Particle, Point } from '../types';

/**
 * Created by Bu Wen Jia You
 * High-performance particle engine for cinematic transitions
 */
export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private numParticles: number = 2500;
  private width: number = 0;
  private height: number = 0;
  private progress: number = 0; // 0 to 1
  private state: 'IDLE' | 'CHARGE' | 'WARP' | 'FORMING' | 'EXPLODE' | 'FINAL' = 'IDLE';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error("Canvas context failed");
    this.ctx = context;
    this.resize();
    this.initParticles();
  }

  public resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const x = Math.random() * this.width;
    const y = Math.random() * this.height;
    return {
      x, y,
      originX: x, originY: y,
      targetX: x, targetY: y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      color: '#00f2ff',
      alpha: Math.random() * 0.5 + 0.3,
      friction: 0.95,
      ease: 0.05 + Math.random() * 0.1
    };
  }

  public setState(state: any) {
    this.state = state;
    if (state === 'EXPLODE') {
      this.particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
      });
    }
  }

  public setProgress(p: number) {
    this.progress = p;
  }

  // Sampling points from text for the "Horse" or "Name"
  public samplePoints(text: string, fontSize: number, font: string = 'Noto Sans SC'): Point[] {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d')!;
    offCanvas.width = this.width;
    offCanvas.height = this.height;
    
    offCtx.fillStyle = 'white';
    offCtx.font = `900 ${fontSize}px ${font}`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, this.width / 2, this.height / 2);

    const imageData = offCtx.getImageData(0, 0, this.width, this.height).data;
    const points: Point[] = [];
    const step = 4; // Sample every 4th pixel

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const index = (y * this.width + x) * 4;
        if (imageData[index] > 128) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }

  public updateTargets(targetPoints: Point[], color: string = '#00f2ff') {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const target = targetPoints[i % targetPoints.length];
      p.targetX = target.x + (Math.random() - 0.5) * 10;
      p.targetY = target.y + (Math.random() - 0.5) * 10;
      p.color = color;
    }
  }

  public render() {
    this.ctx.fillStyle = '#000b1e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const isWarping = this.state === 'WARP';
    const isCharging = this.state === 'CHARGE';

    this.particles.forEach(p => {
      if (this.state === 'IDLE') {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > this.width) p.vx *= -1;
        if (p.y < 0 || p.y > this.height) p.vy *= -1;
      } else if (isCharging) {
          const dx = this.width / 2 - p.x;
          const dy = this.height / 2 - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const force = (this.progress * 100) / (dist + 1);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.9;
          p.vy *= 0.9;
      } else if (isWarping) {
          const centerX = this.width / 2;
          const centerY = this.height / 2;
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.vx = (dx / dist) * (20 + this.progress * 30);
          p.vy = (dy / dist) * (20 + this.progress * 30);
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
            p.x = centerX + (Math.random() - 0.5) * 50;
            p.y = centerY + (Math.random() - 0.5) * 50;
          }
      } else {
          p.x += (p.targetX - p.x) * p.ease;
          p.y += (p.targetY - p.y) * p.ease;
          p.vx *= p.friction;
          p.vy *= p.friction;
          p.x += p.vx;
          p.y += p.vy;
      }

      this.ctx.beginPath();
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      
      if (isWarping) {
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = p.color;
        this.ctx.stroke();
      } else {
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    requestAnimationFrame(() => this.render());
  }
}
