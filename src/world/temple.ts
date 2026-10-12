import { STONE, WATER, buildIsland } from "./island";
import { createBuilder, type Voxel } from "./voxel";

const SANDSTONE = ["#b9a27c", "#c4ad86", "#ad9672", "#cbb690"];
const FRIEZE = ["#9c8664", "#a38c69"];
const LEDGE = "#d6c4a0";
const STEP = "#dccba8";
const TOWER = ["#c9a878", "#d2b384", "#bf9f70"];
const DOOR = "#2a2420";
const ROOF = ["#6e5a44", "#7a634a"];
const FLAG = ["#a8916d", "#b29b76", "#9f8865"];
const MOSS = ["#6f776a", "#646e5e", "#7d8474", "#5a6a50"];
const VINE = ["#2f7a52", "#2a6b48"];
const GOLD = "#e8c26a";
const FLAME = "#f2a65a";
const LOTUS = ["#e6a6c0", "#3f8f5f"];
const BLOSSOM = ["#e6a6c0", "#efb9cf", "#d98fae"];
const LEAF = ["#2f9e6e", "#37b07b", "#2a8c62", "#246f50"];
const BARK = ["#6b4a33", "#5c3f2b"];
const TENT = ["#b85c3e", "#c9a35a"];

const G = 1; // the flat island's surface sits at y = 0, so everything is built from y = 1
/** Chebyshev distance from the centre: the temple grounds are square. */
const ring = (x: number, z: number) => Math.max(Math.abs(x), Math.abs(z));
/** The four causeways that cross the moat, three cells wide. */
const onCauseway = (x: number, z: number) => Math.abs(x) <= 1 || Math.abs(z) <= 1;
const COURT = 7; // paved courtyard reaches ring 7
const inMoat = (x: number, z: number) => (ring(x, z) === 8 || ring(x, z) === 9) && !onCauseway(x, z);
/** Half-width of the stepped pyramid at each level: four tiers, two levels each. */
const half = (y: number) => 5 - Math.floor((y - 1) / 2);
const LEVELS = 8;
/** When each pyramid level is restored, bottom to top. */
const levelT = (y: number) => 0.17 + (y - 1) * 0.05;

/** Rotates a (lateral, outward) offset onto one of the four sides. */
const SIDES = [
  (l: number, r: number) => [l, r],
  (l: number, r: number) => [r, -l],
  (l: number, r: number) => [-l, -r],
  (l: number, r: number) => [-r, l],
] as const;

/**
 * Generates an Ancient Temple: mossy ruins in a jungle clearing are uncovered, the courtyard is
 * paved and the moat refilled, the stepped pyramid is rebuilt tier by tier, and finally the
 * sanctuary tower, gates, shrines and lanterns crown it in gold. Pure and deterministic for a given seed.
 */
export function generateTemple(seed: number): Voxel[] {
  const b = createBuilder(seed);
  const { rnd, pick, add, voxels } = b;

  // Paving spreads out from the ruins; the moat is dug and filled once the courtyard is clear
  const paveT = (x: number, z: number) => 0.05 + ring(x, z) * 0.018 + ((x * 7 + z * 13) & 3) * 0.004;
  const moatT = (x: number, z: number) => 0.13 + ((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * 0.1;
  const paved = (x: number, z: number) => ring(x, z) <= COURT || (onCauseway(x, z) && ring(x, z) <= 11);
  const { topAt } = buildIsland(b, {
    radius: 13,
    roughness: 0,
    mound: false,
    pond: false,
    topUntil: (x, z) => (inMoat(x, z) ? moatT(x, z) : paved(x, z) ? paveT(x, z) : undefined),
  });
  const onIsland = (x: number, z: number) => topAt(x, z) !== undefined;

  for (let x = -13; x <= 13; x++)
    for (let z = -13; z <= 13; z++) {
      if (!onIsland(x, z)) continue;
      if (inMoat(x, z)) add(x, 0, z, WATER, moatT(x, z), 0.82);
      else if (paved(x, z)) add(x, 0, z, ring(x, z) <= COURT && (x + z) % 2 ? FLAG[2] : pick(FLAG), paveT(x, z));
    }
  // Lotus pads drift on the moat
  for (let i = 0; i < 18; i++) {
    const x = Math.round((rnd() * 2 - 1) * 9), z = Math.round((rnd() * 2 - 1) * 9);
    if (inMoat(x, z) && onIsland(x, z)) add(x, G, z, LOTUS[rnd() < 0.35 ? 0 : 1], moatT(x, z) + 0.15 + rnd() * 0.3, 0.42, { h: 0.25 });
  }

  // The stepped pyramid. Its lower tiers stand from the start as mossy ruins, each voxel
  // giving way to clean sandstone when its level is restored.
  for (let y = 1; y <= LEVELS; y++) {
    const h = half(y);
    const top = y % 2 === 0;
    for (let x = -h; x <= h; x++)
      for (let z = -h; z <= h; z++) {
        const edge = ring(x, z) === h;
        const t = levelT(y) + rnd() * 0.03;
        add(x, y, z, edge ? (top ? LEDGE : pick(FRIEZE)) : pick(SANDSTONE), t);
        const ruinChance = y === 1 ? 0.85 : y === 2 ? 0.55 : y === 3 ? 0.3 : y === 4 ? 0.12 : 0;
        if (rnd() < ruinChance) add(x, y, z, pick(MOSS), 0, 1, { until: t });
      }
  }
  // Vines hang off the ruins until the clean-up reaches them
  for (let i = 0; i < 40; i++) {
    const side = SIDES[Math.floor(rnd() * 4)];
    const [x, z] = side(Math.round((rnd() * 2 - 1) * 5), 6);
    const y = 1 + Math.floor(rnd() * 2);
    add(x, y, z, pick(VINE), 0, 0.5, { until: 0.1 + rnd() * 0.1 });
  }

  // Grand stairways climb all four faces
  for (const side of SIDES)
    for (let r = 3; r <= COURT; r++)
      for (let l = -1; l <= 1; l++) {
        const H = LEVELS - r;
        const [x, z] = side(l, r);
        for (let y = 1; y <= H; y++) add(x, y, z, y === H ? STEP : pick(SANDSTONE), levelT(y) + 0.02);
      }

  // The sanctuary tower rises from the top tier, with a doorway on each face
  const towerTop = LEVELS + 7;
  for (let y = LEVELS + 1; y <= towerTop; y++) {
    const k = y - LEVELS - 1;
    const h = k < 5 ? 1 : 0;
    const t = 0.6 + k * 0.03;
    for (let x = -h; x <= h; x++)
      for (let z = -h; z <= h; z++) {
        if (k >= 3 && k < 5 && Math.abs(x) + Math.abs(z) === 2) continue;
        const door = k < 2 && Math.abs(x) + Math.abs(z) === 1;
        add(x, y, z, door ? DOOR : k === 2 || k === 4 ? LEDGE : pick(TOWER), t);
      }
  }
  add(0, towerTop + 1, 0, GOLD, 0.93, 0.7);
  add(0, towerTop + 2, 0, GOLD, 0.97, 0.4);

  // Corner towers on the third tier
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const x = sx * 3, z = sz * 3;
    for (let y = 7; y <= 9; y++) add(x, y, z, y === 9 ? LEDGE : pick(TOWER), 0.66 + (y - 7) * 0.025 + rnd() * 0.02);
    add(x, 10, z, GOLD, 0.9 + rnd() * 0.05, 0.5);
  }

  // Shrines in the courtyard corners, rebuilt over fallen pillars
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const cx = sx * 6, cz = sz * 6;
    const t = 0.62 + rnd() * 0.06;
    const stub = 1 + Math.floor(rnd() * 2);
    for (let y = 1; y <= stub; y++) add(cx, y, cz, pick(MOSS), 0, 0.8, { until: t });
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) add(cx + dx, 1, cz + dz, pick(SANDSTONE), t, 1, { h: 0.5 });
    add(cx, 2, cz, pick(TOWER), t + 0.02, 0.6);
    add(cx, 3, cz, pick(TOWER), t + 0.03, 0.6);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) add(cx + dx, 4, cz + dz, pick(ROOF), t + 0.05, 1, { h: 0.4 });
    add(cx, 5, cz, GOLD, 0.92 + rnd() * 0.06, 0.4);
  }

  // A gate where each causeway reaches the far bank
  SIDES.forEach((side, i) => {
    const t = 0.66 + i * 0.025;
    const r = 10;
    if (![-2, 2].every((l) => onIsland(...(side(l, r) as [number, number])))) return;
    for (const l of [-2, 2]) {
      const [x, z] = side(l, r);
      for (let y = 1; y <= 4; y++) add(x, y, z, pick(TOWER), t + y * 0.006);
    }
    for (let l = -2; l <= 2; l++) {
      const [x, z] = side(l, r);
      add(x, 5, z, LEDGE, t + 0.03);
      if (Math.abs(l) <= 1) add(x, 6, z, pick(ROOF), t + 0.04, 1, { h: 0.5 });
    }
    const [x, z] = side(0, r);
    add(x, 7, z, GOLD, 0.94 + rnd() * 0.05, 0.4);
  });

  // Lanterns ring the courtyard and line the causeways; they are lit last
  for (let x = -COURT; x <= COURT; x++)
    for (let z = -COURT; z <= COURT; z++) {
      if (ring(x, z) !== COURT || (x + z) % 3 || onCauseway(x, z)) continue;
      const t = 0.72 + rnd() * 0.12;
      add(x, 1, z, pick(STONE), t, 0.4);
      add(x, 2, z, FLAME, 0.88 + rnd() * 0.1, 0.3);
    }
  for (const side of SIDES)
    for (const l of [-2, 2]) {
      const [x, z] = side(l, 11);
      if (!onIsland(x, z)) continue;
      add(x, 1, z, pick(STONE), 0.74 + rnd() * 0.1, 0.4);
      add(x, 2, z, FLAME, 0.9 + rnd() * 0.08, 0.3);
    }
  // Braziers on the tier corners
  for (let y = 2; y <= LEVELS; y += 2) {
    const h = half(y);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      if (y === 6) continue; // corner towers
      add(sx * h, y + 1, sz * h, FLAME, 0.9 + rnd() * 0.08, 0.35);
    }
  }

  // A pilgrims' camp on the far bank while the restoration is under way
  const camp = SIDES[Math.floor(rnd() * 4)];
  [[-3, 11], [3, 11], [0, 12]].forEach(([l, r], i) => {
    const [x, z] = camp(l, r);
    if (!onIsland(x, z)) return;
    if (i < 2) {
      add(x, 1, z, TENT[i], 0.015 + i * 0.02, 0.85, { h: 0.7, until: 0.62 });
      add(x, 2, z, TENT[i], 0.03 + i * 0.02, 0.45, { h: 0.6, until: 0.62 });
    } else add(x, 1, z, FLAME, 0.05, 0.35, { until: 0.62 });
  });

  // Jungle: undergrowth fills the grounds at first and is cleared from the ruins outward,
  // while the tall forest beyond the moat stays. Blossom trees are planted in the courtyard late on.
  for (let x = -13; x <= 13; x++)
    for (let z = -13; z <= 13; z++) {
      const ty = topAt(x, z);
      if (ty === undefined) continue;
      const r = ring(x, z);
      if (r <= COURT || inMoat(x, z) || (onCauseway(x, z) && r <= 11)) {
        if (r <= half(1) + 0.5 || rnd() > 0.3) continue;
        const until = 0.08 + r * 0.03 + rnd() * 0.04;
        add(x, 1, z, pick(LEAF), 0, 0.55 + rnd() * 0.35, { until });
        if (rnd() < 0.3) add(x, 2, z, pick(LEAF), 0, 0.5, { until });
      } else if (r >= 10 && rnd() < 0.16) {
        jungleTree(x, z, 0, 3 + Math.floor(rnd() * 3));
      }
    }
  // Young trees keep the forest growing as the temple is restored
  for (let i = 0; i < 32; i++) {
    const x = Math.round((rnd() * 2 - 1) * 13), z = Math.round((rnd() * 2 - 1) * 13);
    if (!onIsland(x, z) || ring(x, z) < 10 || (onCauseway(x, z) && ring(x, z) <= 11)) continue;
    jungleTree(x, z, 0.02 + rnd() * 0.86, 2 + Math.floor(rnd() * 2));
  }
  for (const [x, z] of [[4, 6], [-4, 6], [6, 4], [6, -4], [4, -6], [-4, -6], [-6, 4], [-6, -4]]) {
    const t = 0.78 + rnd() * 0.14;
    add(x, 1, z, pick(BARK), t, 0.35);
    add(x, 2, z, pick(BLOSSOM), t + 0.02, 0.8);
    if (rnd() < 0.6) add(x, 3, z, pick(BLOSSOM), t + 0.04, 0.5);
  }

  function jungleTree(x: number, z: number, t: number, height: number) {
    const lag = t > 0 ? 1 : 0; // the original forest is all there at the start
    for (let y = 1; y <= height; y++) add(x, y, z, pick(BARK), t + lag * y * 0.005, 0.5);
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++)
        for (let dy = 0; dy <= 1; dy++) {
          if (dy === 1 && Math.abs(dx) + Math.abs(dz) === 2) continue;
          if (rnd() < 0.15) continue;
          add(x + dx, height + 1 + dy, z + dz, pick(LEAF), t + lag * (0.03 + dy * 0.01));
        }
  }

  return voxels;
}
