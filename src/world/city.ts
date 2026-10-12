import { buildIsland } from "./island";
import { createBuilder, type Voxel } from "./voxel";

const PATH = ["#5a4a38", "#54452f"];
const PAVING = "#3a4045";
const PLASTER = ["#c9b79a", "#b8a283", "#a99377"];
const ROOF = ["#8a4b3a", "#7a4334", "#93573f"];
const CONCRETE = ["#56616a", "#4b555d", "#606b73"];
const GLASS = ["#2f4a55", "#35525e", "#2a424c"];
const LIT = ["#8fe6ee", "#e8c26a"];
const TOWER_TOP = "#2a3034";
const BEACON = "#e8c26a";
const LEAF = ["#2f9e6e", "#37b07b", "#43c287"];
const TRUNK = "#6b4a33";
const TENT = ["#d08a4a", "#e6ece9", "#c46d3c"];
const FIRE = "#e8c26a";

/** A road runs along each axis; buildings sit on 2x2 plots between them. */
const isRoad = (x: number, z: number) => Math.abs(x) <= 1 || Math.abs(z) <= 1;

/**
 * Generates a Voxel City: a camp on a flat island grows into a village of plaster
 * houses, then a town, then concrete and glass towers rising from the centre.
 * Pure and deterministic for a given seed.
 */
export function generateCity(seed: number): Voxel[] {
  const b = createBuilder(seed);
  const { rnd, pick, add, voxels } = b;
  const { topAt } = buildIsland(b, {
    radius: 10,
    roughness: 0,
    mound: false,
    pond: false,
    topColor: (x, z) => (isRoad(x, z) ? (Math.abs(x) <= 1 && Math.abs(z) <= 1 ? PAVING : pick(PATH)) : undefined),
  });
  const groundAt = (x: number, z: number) => topAt(x, z);

  // Camp: tents and a fire on the plaza, there from the start
  add(0, (groundAt(0, 0) ?? 0) + 1, 0, FIRE, 0, 0.45);
  [[-2, -2], [2, -2], [-2, 2]].forEach(([x, z]) => {
    const g = groundAt(x, z);
    if (g !== undefined) add(x, g + 1, z, pick(TENT), 0, 0.7);
  });

  // Plots: 2x2 footprints between the roads that fit on the island
  const plots: { x: number; z: number; d: number }[] = [];
  const LINES = [-9, -6, -3, 2, 5, 8];
  for (const x of LINES)
    for (const z of LINES) {
      const cells = [[x, z], [x + 1, z], [x, z + 1], [x + 1, z + 1]];
      if (cells.some(([cx, cz]) => isRoad(cx, cz) || groundAt(cx, cz) === undefined)) continue;
      plots.push({ x, z, d: Math.hypot(x + 0.5, z + 0.5) });
    }
  // Inner plots are settled first; a little jitter keeps the order organic
  plots.sort((a, c) => a.d + rnd() * 2 - (c.d + rnd() * 2));

  const maxD = Math.max(...plots.map((p) => p.d), 1);
  plots.forEach((p, rank) => {
    const start = 0.06 + 0.5 * (rank / plots.length);
    const central = 1 - p.d / maxD;
    const height = Math.max(2, Math.round((2 + central * 11) * (0.75 + rnd() * 0.5)));
    const wall = pick(PLASTER), roof = pick(ROOF), concrete = pick(CONCRETE);
    const cells = [[p.x, p.z], [p.x + 1, p.z], [p.x, p.z + 1], [p.x + 1, p.z + 1]];
    const g = Math.max(...cells.map(([cx, cz]) => groundAt(cx, cz) ?? 0));
    for (let k = 1; k <= height; k++) {
      // Two storeys arrive as a house; anything above rises later as the city densifies
      const t = k <= 2 ? start + 0.03 * k : Math.max(start + 0.1, 0.5) + 0.42 * ((k - 2) / 11) + rnd() * 0.03;
      const tall = height > 3;
      cells.forEach(([cx, cz]) => {
        let color: string;
        // Towers start life as flat-roofed plaster houses, so the lower storeys stay plaster
        if (k === height) color = tall ? TOWER_TOP : roof;
        else if (k <= 2) color = wall;
        else color = rnd() < 0.12 ? pick(LIT) : (k + cx + cz) % 3 === 0 ? concrete : pick(GLASS);
        add(cx, g + k, cz, color, t);
      });
    }
    if (height >= 9) add(p.x, g + height + 1, p.z, BEACON, 0.95 + rnd() * 0.05, 0.4);
  });

  // Street trees fill in over time
  for (let i = 0; i < 28; i++) {
    const x = Math.round((rnd() * 2 - 1) * 9), z = Math.round((rnd() * 2 - 1) * 9);
    const g = groundAt(x, z);
    if (g === undefined || isRoad(x, z)) continue;
    const t = 0.2 + rnd() * 0.7;
    if (add(x, g + 1, z, TRUNK, t, 0.4)) add(x, g + 2, z, pick(LEAF), t + 0.02, 0.7);
  }
  return voxels;
}
