import type { Builder } from "./voxel";

export const GRASS = ["#2b5a45", "#2f634b", "#285240", "#336b51"];
export const DIRT = ["#4a3a2d", "#544130", "#433428"];
export const STONE = ["#353d42", "#3f474d", "#2d3439"];
const WATER = "#3fb3bf";

interface IslandOptions {
  radius: number;
  /** 0 = flat plateau, 1 = gently rolling. */
  roughness: number;
  /** Raise a mound in the middle (for a tree). */
  mound: boolean;
  pond: boolean;
  /** Overrides the top colour of a cell (paths, plazas). */
  topColor?: (x: number, z: number) => string | undefined;
}

/** Builds a floating island (present from the start, t = 0) and returns its surface height lookup. */
export function buildIsland(b: Builder, opts: IslandOptions) {
  const { rnd, noise, pick, add } = b;
  const R = opts.radius;
  const top = new Map<string, number>();
  const pond = { x: 4 + Math.floor(rnd() * 2), z: -4 - Math.floor(rnd() * 2) };
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      const d = Math.hypot(x, z);
      const edge = R - 2 + noise(x * 0.35 + 3, z * 0.35 + 7) * 2.6;
      if (d > edge) continue;
      const k = 1 - d / edge;
      const ty = Math.round(noise(x * 0.22 + 11, z * 0.22 - 4) * 1.4 * opts.roughness + (opts.mound && d < 3.2 ? 1 : 0));
      const by = -Math.round(k * 6.5 + noise(x * 0.5, z * 0.5) * 2.2) - 1;
      top.set(`${x},${z}`, ty);
      const inPond = opts.pond && Math.hypot(x - pond.x, z - pond.z) < 1.9 && d < edge - 1.5;
      for (let y = by; y <= ty; y++) {
        if (y === ty) add(x, y, z, inPond ? WATER : opts.topColor?.(x, z) ?? pick(GRASS), 0, inPond ? 0.82 : 1);
        else add(x, y, z, y >= ty - 2 ? pick(DIRT) : pick(STONE), 0);
      }
    }
  }
  return {
    topAt: (x: number, z: number) => top.get(`${x},${z}`),
    nearPond: (x: number, z: number, r: number) => opts.pond && Math.hypot(x - pond.x, z - pond.z) < r,
  };
}

/** Scatters small voxels on the surface that appear between `from` and 1. */
export function scatter(b: Builder, topAt: (x: number, z: number) => number | undefined, count: number, colors: readonly string[], from: number, keep: (x: number, z: number) => boolean) {
  for (let i = 0; i < count; i++) {
    const x = Math.round((b.rnd() * 2 - 1) * 9), z = Math.round((b.rnd() * 2 - 1) * 9);
    const ty = topAt(x, z);
    if (ty === undefined || !keep(x, z)) continue;
    b.add(x, ty + 1, z, b.pick(colors), from + b.rnd() * (1 - from), 0.38);
  }
}
