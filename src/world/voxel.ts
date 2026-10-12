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
  /** Extra vertical scale for flat pieces such as roads, fields and roofs (default 1). */
  h?: number;
  /** World progress at which this voxel is removed again (demolished to make way for something bigger). */
  until?: number;
  /** A placeholder voxel that shows only before real growth starts (the bonsai seed). */
  isSeed?: boolean;
}

interface AddOptions {
  h?: number;
  until?: number;
}

/**
 * Shared seeded helpers for world generators. A cell holds one voxel at a time: a voxel whose
 * lifetime overlaps one already in its cell is ignored, so later buildings can replace earlier ones.
 */
export function createBuilder(seed: number) {
  const rnd = mulberry32(seed);
  const noise = valueNoise2D(seed);
  const voxels: Voxel[] = [];
  const occupied = new Map<string, [number, number][]>();
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const add = (x: number, y: number, z: number, color: string, t: number, scale = 1, opts: AddOptions = {}) => {
    const key = `${x},${y},${z}`;
    const from = Math.max(0, Math.min(1, t));
    const to = opts.until ?? Infinity;
    if (to <= from) return false;
    const spans = occupied.get(key) ?? [];
    if (spans.some(([a, b]) => from < b && a < to)) return false;
    spans.push([from, to]);
    occupied.set(key, spans);
    const v: Voxel = { x, y, z, color, t: from, scale };
    if (opts.h !== undefined) v.h = opts.h;
    if (opts.until !== undefined) v.until = opts.until;
    voxels.push(v);
    return true;
  };
  return { rnd, noise, pick, add, voxels };
}

export type Builder = ReturnType<typeof createBuilder>;

/** Whether a voxel is visible at the given progress. */
export const isVisible = (v: Voxel, progress: number) =>
  v.isSeed ? progress < 0.04 : v.t <= progress && (v.until === undefined || progress < v.until);
