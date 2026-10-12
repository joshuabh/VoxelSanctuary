import { buildIsland } from "./island";
import { createBuilder, type Voxel } from "./voxel";

const ASPHALT = "#2b3034";
const JUNCTION = "#363c41";
const DIRT_ROAD = ["#5a4a38", "#54452f"];
const CROPS = [["#9a8a3a", "#a8963f"], ["#5f8a3a", "#6b9a42"], ["#b48a3c", "#c29a45"]];
const BARN = "#8a3a2e";
const SIDING = ["#c9b79a", "#b8a283", "#d6cbb4", "#a9b7b0", "#b9a68f"];
const ROOF = ["#8a4b3a", "#5b6670", "#7a4334", "#4d5a52", "#93573f"];
const BRICK = ["#7d4a3a", "#8a5a46", "#6e4235", "#9a8676"];
const CONCRETE = ["#56616a", "#4b555d", "#606b73", "#6d767c"];
const GLASS = ["#2f4a55", "#35525e", "#2a424c", "#3b5a66"];
const LIT = ["#8fe6ee", "#e8c26a", "#f2dfa0"];
const TOWER_TOP = "#262c30";
const BEACON = "#e8c26a";
const LEAF = ["#2f9e6e", "#37b07b", "#43c287", "#2a8c62"];
const TRUNK = "#6b4a33";
const POOL = "#5fd0dc";
const CAR = ["#d9dde0", "#c0463a", "#3a6ea5", "#e8c26a", "#2b3034"];

/** Road lines run every 5 cells in both directions; blocks between them hold four 2x2 lots. */
const LINES = [-15, -10, -5, 0, 5, 10, 15];
const SPACING = 5;
/** Rough radius of the buildable island, used to normalise distance from the centre. */
const REACH = 12;

/** A straight road between two junctions, used by the traffic layer. */
export interface Lane {
  ax: number;
  az: number;
  bx: number;
  bz: number;
  /** World progress at which this stretch is paved. */
  t: number;
}

export interface CityWorld {
  voxels: Voxel[];
  lanes: Lane[];
}

const onLine = (v: number) => LINES.includes(v);
const isRoadCell = (x: number, z: number) => onLine(x) || onLine(z);
const isMain = (x: number, z: number) => x === 0 || z === 0;

/** Paving spreads outward from the crossroads; the two main roads come first. */
function segmentT(fixed: number, along: number, main: boolean) {
  const centre = Math.floor(along / SPACING) * SPACING + SPACING / 2;
  const dn = Math.hypot(fixed, centre) / REACH;
  return main ? Math.max(0, -0.04 + dn * 0.3) : 0.12 + dn * 0.5;
}
function roadT(x: number, z: number) {
  let t = Infinity;
  if (onLine(x)) t = Math.min(t, segmentT(x, z, x === 0));
  if (onLine(z)) t = Math.min(t, segmentT(z, x, z === 0));
  return t;
}

const cache = new Map<number, CityWorld>();

/**
 * Generates a Voxel City: a small country town with farms around it spreads into suburbs,
 * then a mid-rise city whose centre is rebuilt again and again until skyscrapers stand
 * downtown. Pure and deterministic for a given seed.
 */
export function generateCityWorld(seed: number): CityWorld {
  const hit = cache.get(seed);
  if (hit) return hit;

  const b = createBuilder(seed);
  const { rnd, pick, add, voxels } = b;
  const { topAt } = buildIsland(b, {
    radius: 15,
    roughness: 0,
    mound: false,
    pond: false,
    topColor: (x, z) => (isRoadCell(x, z) && isMain(x, z) ? pick(DIRT_ROAD) : undefined),
  });
  const onIsland = (x: number, z: number) => topAt(x, z) !== undefined;
  const G = 1; // the flat island's surface sits at y = 0, so everything is built from y = 1

  // Roads: a thin asphalt slab over every road cell, paved when its stretch is reached
  for (let x = -15; x <= 15; x++)
    for (let z = -15; z <= 15; z++) {
      if (!isRoadCell(x, z) || !onIsland(x, z)) continue;
      add(x, G, z, onLine(x) && onLine(z) ? JUNCTION : ASPHALT, roadT(x, z), 1, { h: 0.12 });
    }

  // Lanes for traffic: each stretch between two junctions that is fully on the island
  const lanes: Lane[] = [];
  for (const c of LINES)
    for (let i = 0; i < LINES.length - 1; i++) {
      const [a, z1] = [LINES[i], LINES[i + 1]];
      const cells = Array.from({ length: SPACING + 1 }, (_, k) => a + k);
      if (cells.every((v) => onIsland(c, v))) lanes.push({ ax: c, az: a, bx: c, bz: z1, t: segmentT(c, a + 1, c === 0) });
      if (cells.every((v) => onIsland(v, c))) lanes.push({ ax: a, az: c, bx: z1, bz: c, t: segmentT(c, a + 1, c === 0) });
    }

  // Lots: four 2x2 lots per block, each developing through zones over time
  for (let i = 0; i < LINES.length - 1; i++)
    for (let j = 0; j < LINES.length - 1; j++)
      for (const ox of [1, 3])
        for (const oz of [1, 3]) {
          const x0 = LINES[i] + ox, z0 = LINES[j] + oz;
          const cells: [number, number][] = [[x0, z0], [x0 + 1, z0], [x0, z0 + 1], [x0 + 1, z0 + 1]];
          if (!cells.every(([x, z]) => onIsland(x, z))) continue;
          developLot(cells, x0, z0);
        }

  function developLot(cells: [number, number][], x0: number, z0: number) {
    const dn = Math.hypot(x0 + 0.5, z0 + 0.5) / REACH;
    const jitter = rnd() * 0.08;
    // The lot is reachable once the road along either of its outer edges is paved
    const sideX = x0 === Math.floor(x0 / SPACING) * SPACING + 1 ? x0 - 1 : x0 + 2;
    const sideZ = z0 === Math.floor(z0 / SPACING) * SPACING + 1 ? z0 - 1 : z0 + 2;
    const reach = Math.min(roadT(sideX, z0), roadT(x0, sideZ));

    if (dn > 0.3 && dn < 0.62 && rnd() < 0.1) return park(cells, Math.max(reach, 0.25 + jitter));

    let houseFrom = Math.max(reach, -0.08 + dn * 0.55 + jitter);
    if (dn > 0.6) {
      const farmUntil = Math.min(0.85, 0.3 + (dn - 0.6) * 1.4 + jitter);
      farm(cells, farmUntil);
      houseFrom = Math.max(houseFrom, farmUntil);
    }

    if (dn < 0.32) {
      const midFrom = Math.max(houseFrom + 0.08, 0.3 + dn * 0.6 + jitter);
      const towerFrom = Math.max(midFrom + 0.1, 0.62 + dn * 0.6 + jitter);
      house(cells, houseFrom, midFrom);
      midrise(cells, dn, midFrom, towerFrom);
      tower(cells, dn, towerFrom);
    } else if (dn < 0.56) {
      const midFrom = Math.max(houseFrom + 0.1, 0.45 + dn * 0.5 + jitter);
      house(cells, houseFrom, midFrom);
      midrise(cells, dn, midFrom);
    } else {
      house(cells, houseFrom);
    }
  }

  function farm(cells: [number, number][], until: number) {
    const crop = pick(CROPS);
    cells.forEach(([x, z]) => add(x, G, z, crop[(x + z) % 2], 0, 1, { h: 0.22, until }));
    if (rnd() < 0.25) {
      const [x, z] = cells[Math.floor(rnd() * 4)];
      add(x, G, z, BARN, 0, 1, { until });
      add(x, G + 1, z, pick(ROOF), 0, 1, { h: 0.5, until });
    }
  }

  function park(cells: [number, number][], from: number) {
    cells.forEach(([x, z]) => {
      if (rnd() < 0.7) tree(x, z, from + rnd() * 0.1);
    });
  }

  function tree(x: number, z: number, t: number, until?: number) {
    if (add(x, G, z, TRUNK, t, 0.35, { until })) add(x, G + 1, z, pick(LEAF), t + 0.02, 0.75, { until });
  }

  function house(cells: [number, number][], from: number, until?: number) {
    if (until !== undefined && until - from < 0.04) return;
    // Two cells hold the house, the other two the yard
    const alongX = rnd() < 0.5;
    const body = alongX ? [cells[0], cells[1]] : [cells[0], cells[2]];
    const yard = cells.filter((c) => !body.includes(c));
    const floors = rnd() < 0.3 ? 2 : 1;
    const wall = pick(SIDING), roof = pick(ROOF);
    body.forEach(([x, z]) => {
      for (let k = 0; k < floors; k++) add(x, G + k, z, wall, from + 0.015 * k, 1, { until });
      add(x, G + floors, z, roof, from + 0.03, 1, { h: 0.45, until });
    });
    yard.forEach(([x, z]) => {
      const r = rnd();
      if (r < 0.45) tree(x, z, from + 0.04, until);
      else if (r < 0.55) add(x, G, z, POOL, from + 0.05, 1, { h: 0.18, until });
      else if (r < 0.75) add(x, G, z, pick(CAR), from + 0.03, 0.42, { h: 0.6, until });
    });
  }

  function midrise(cells: [number, number][], dn: number, from: number, until?: number) {
    const floors = Math.max(3, Math.round((3 + (1 - dn) * 5) * (0.7 + rnd() * 0.5)));
    const wall = pick(rnd() < 0.5 ? BRICK : CONCRETE);
    const span = Math.min(0.12, (until ?? 1) - from - 0.02);
    for (let k = 0; k < floors; k++) {
      const t = from + span * (k / floors);
      cells.forEach(([x, z]) => add(x, G + k, z, k > 0 && rnd() < 0.18 ? pick(LIT) : wall, t, 1, { until }));
    }
    cells.forEach(([x, z]) => add(x, G + floors, z, TOWER_TOP, from + span, 1, { h: 0.25, until }));
    const [ax, az] = cells[Math.floor(rnd() * 4)];
    add(ax, G + floors + 1, az, CONCRETE[0], from + span, 0.45, { until });
  }

  function tower(cells: [number, number][], dn: number, from: number) {
    const floors = Math.round((11 + (1 - dn / 0.32) * 13) * (0.75 + rnd() * 0.45));
    const skin = pick(GLASS), band = pick(CONCRETE);
    for (let k = 0; k < floors; k++) {
      const t = from + (0.98 - from) * (k / floors);
      cells.forEach(([x, z]) => {
        const color = k % 4 === 0 ? band : rnd() < 0.14 ? pick(LIT) : skin;
        add(x, G + k, z, color, t, 1);
      });
    }
    // Crown: a narrower top and a beacon
    const [cx, cz] = cells[0];
    add(cx, G + floors, cz, TOWER_TOP, 0.97, 1);
    add(cx, G + floors + 1, cz, TOWER_TOP, 0.98, 0.6);
    add(cx, G + floors + 2, cz, BEACON, 0.99, 0.35);
  }

  // Street trees along the main roads, planted as the town matures
  for (let k = 0; k < 40; k++) {
    const x = Math.round((rnd() * 2 - 1) * 13), z = Math.round((rnd() * 2 - 1) * 13);
    if (!onIsland(x, z) || isRoadCell(x, z)) continue;
    tree(x, z, 0.2 + rnd() * 0.6);
  }

  const world = { voxels, lanes };
  cache.set(seed, world);
  if (cache.size > 8) cache.delete(cache.keys().next().value!);
  return world;
}

export const generateCity = (seed: number) => generateCityWorld(seed).voxels;
export const cityLanes = (seed: number) => generateCityWorld(seed).lanes;
