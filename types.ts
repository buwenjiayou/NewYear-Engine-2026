
export enum AppAct {
  BARRIER = 'BARRIER',
  LEAP = 'LEAP',
  REVELATION = 'REVELATION'
}

export interface Point {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  friction: number;
  ease: number;
}
