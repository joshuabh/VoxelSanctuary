import { STONE, buildIsland, scatter } from "./island";
import { createBuilder, type Voxel } from "./voxel";

const BARK = ["#6b4a33", "#77533a", "#5c3f2b"];
const LEAF = ["#2f9e6e", "#37b07b", "#43c287", "#2a8c62"];
const LEAF_TOP = "#55d39a";
const BLOSSOM = "#e8c26a";
const FLOWER = ["#8fe6ee", "#e8c26a", "#e6ece9", "#b9a6f0"];

/**
 * Generates a Bonsai Garden: a floating island with a pond, rocks and wildflowers,
 * and a tree whose voxels carry the progress value at which they grow in.
 * Pure and deterministic for a given seed.
 */
export function generateBonsai(seed: number): Voxel[] {
  const b = createBuilder(seed);
  const { rnd, pick, add, voxels } = b;
  const { topAt, nearPond } = buildIsland(b, { radius: 8, roughness: 1, mound: true, pond: true });

  // Rocks
  for (let i = 0; i < 6; i++) {
    const x = Math.round((rnd() * 2 - 1) * 7), z = Math.round((rnd() * 2 - 1) * 7);
    const ty = topAt(x, z);
    if (ty === undefined || Math.hypot(x, z) < 3) continue;
    const h = rnd() > 0.6 ? 2 : 1;
    for (let y = 1; y <= h; y++) add(x, ty + y, z, pick(STONE), 0);
  }

  // Tree
  const gy = (topAt(0, 0) ?? 0) + 1;
  const H = 13;
  const trunkT = (y: number) => 0.02 + 0.66 * (y / H);
  voxels.push({ x: 0, y: gy, z: 0, color: "#8a6a4a", t: 0, scale: 0.5, isSeed: true });
  const trunk: [number, number, number][] = [];
  for (let y = 0; y < H; y++) {
    const x = Math.round(1.7 * Math.sin(y * 0.5 + rnd() * 0.2));
    const z = Math.round(1.1 * Math.sin(y * 0.33 + 1.2));
    trunk.push([x, gy + y, z]);
    add(x, gy + y, z, pick(BARK), trunkT(y));
    if (y < 3) {
      // Girth that fills in as the tree matures
      add(x + 1, gy + y, z, pick(BARK), trunkT(y) + 0.3 + y * 0.04);
      add(x, gy + y, z + 1, pick(BARK), trunkT(y) + 0.34 + y * 0.04);
      if (y < 2) add(x + 1, gy + y, z + 1, pick(BARK), trunkT(y) + 0.4);
    }
  }

  // Surface roots arrive around Trained Bonsai
  [[-1, 0], [2, 0], [0, 2], [1, -1], [2, 2]].forEach(([dx, dz], i) => {
    for (let s = 1; s <= 2; s++) {
      const ty = topAt(dx * s, dz * s);
      if (ty !== undefined) add(dx * s, ty + 1, dz * s, pick(BARK), 0.55 + i * 0.03 + s * 0.02, 0.55);
    }
  });

  const cluster = (cx: number, cy: number, cz: number, rx: number, ry: number, t0: number, span: number) => {
    for (let dx = -Math.ceil(rx); dx <= Math.ceil(rx); dx++)
      for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++)
        for (let dz = -Math.ceil(rx); dz <= Math.ceil(rx); dz++) {
          const e = (dx * dx + dz * dz) / (rx * rx) + (dy * dy) / (ry * ry);
          if (e > 1 || rnd() < 0.1) continue;
          const color = dy >= Math.floor(ry) && rnd() > 0.4 ? LEAF_TOP : pick(LEAF);
          add(cx + dx, cy + dy, cz + dz, color, t0 + span * Math.sqrt(e));
        }
    // Golden blossoms at Master Bonsai
    for (let i = 0; i < 3; i++) {
      const a = rnd() * Math.PI * 2, r = rnd() * rx * 0.7;
      add(Math.round(cx + Math.cos(a) * r), cy + Math.ceil(ry) + 1, Math.round(cz + Math.sin(a) * r), BLOSSOM, 0.92 + rnd() * 0.08, 0.55);
    }
  };

  const branches = [
    { y: 3, len: 4, t: 0.12, rx: 2.8, ry: 1.3 },
    { y: 6, len: 5, t: 0.3, rx: 3.2, ry: 1.5 },
    { y: 8, len: 4, t: 0.44, rx: 2.8, ry: 1.3 },
    { y: 10, len: 3, t: 0.58, rx: 2.5, ry: 1.2 },
  ];
  let ang = rnd() * Math.PI * 2;
  for (const b of branches) {
    const [sx, sy, sz] = trunk[b.y];
    const t0 = Math.max(b.t, trunkT(b.y) + 0.02);
    let x = sx, y = sy, z = sz;
    for (let i = 1; i <= b.len; i++) {
      x = Math.round(sx + Math.cos(ang) * i);
      z = Math.round(sz + Math.sin(ang) * i);
      if (i % 2 === 0) y++;
      add(x, y, z, pick(BARK), t0 + (0.05 * i) / b.len);
    }
    cluster(x, y + 1, z, b.rx, b.ry, t0 + 0.06, 0.16);
    ang += 2.1 + rnd() * 0.6;
  }
  const [tx, ty, tz] = trunk[H - 1];
  cluster(tx, ty + 2, tz, 3.6, 1.8, 0.72, 0.2);

  // Wildflowers spread as the garden matures
  scatter(b, topAt, 40, FLOWER, 0.25, (x, z) => !nearPond(x, z, 2.2) && Math.hypot(x, z) >= 2);
  return voxels;
}
