import { mulberry32, valueNoise2D } from "./rng";

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: string;
  /** World progress (0..1) at which this voxel appears. */
  t: number;
  /** Uniform scale; small voxels sit on the surface below them. */
  scale: number;
  /** A placeholder voxel that shows only before real growth starts (the bonsai seed). */
  isSeed?: boolean;
}

/** Shared seeded helpers for world generators. Cells are unique: a second voxel in a cell is ignored. */
export function createBuilder(seed: number) {
  const rnd = mulberry32(seed);
  const noise = valueNoise2D(seed);
  const voxels: Voxel[] = [];
  const occupied = new Set<string>();
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const add = (x: number, y: number, z: number, color: string, t: number, scale = 1) => {
    const key = `${x},${y},${z}`;
    if (occupied.has(key)) return false;
    occupied.add(key);
    voxels.push({ x, y, z, color, t: Math.max(0, Math.min(1, t)), scale });
    return true;
  };
  return { rnd, noise, pick, add, voxels };
}

export type Builder = ReturnType<typeof createBuilder>;

/** Whether a voxel is visible at the given progress. */
export const isVisible = (v: Voxel, progress: number) => (v.isSeed ? progress < 0.04 : v.t <= progress);
