import { describe, expect, it } from "vitest";
import { generateCityWorld } from "./city";
import { THEMES } from "./themes";
import { isVisible } from "./voxel";

describe.each(Object.values(THEMES))("$name generator", ({ generate }) => {
  it("regrows the same world from the same seed", () => {
    expect(generate(42)).toEqual(generate(42));
  });

  it("grows different worlds from different seeds", () => {
    expect(generate(1)).not.toEqual(generate(2));
  });

  it("never shows two voxels in the same cell at the same time", () => {
    const spans = new Map<string, [number, number][]>();
    for (const v of generate(7)) {
      if (v.isSeed) continue;
      const key = `${v.x},${v.y},${v.z}`;
      const [a, b] = [v.t, v.until ?? Infinity];
      const list = spans.get(key) ?? [];
      expect(list.some(([c, d]) => a < d && c < b)).toBe(false);
      list.push([a, b]);
      spans.set(key, list);
    }
  });

  it("grows at every stage and shows every lasting voxel at completion", () => {
    for (const seed of [3, 99, 2024]) {
      const world = generate(seed);
      const count = (p: number) => world.filter((v) => isVisible(v, p)).length;
      const stages = [0, 0.1, 0.3, 0.6, 1];
      for (let i = 1; i < stages.length; i++) expect(count(stages[i])).toBeGreaterThan(count(stages[i - 1]));
      expect(count(1)).toBe(world.filter((v) => !v.isSeed && v.until === undefined).length);
    }
  });
});

describe("Voxel City", () => {
  const { voxels, lanes } = generateCityWorld(5);
  const tallest = (p: number) => Math.max(...voxels.filter((v) => isVisible(v, p)).map((v) => v.y));

  it("starts as a low country town and ends with skyscrapers", () => {
    expect(tallest(0)).toBeLessThanOrEqual(3);
    expect(tallest(1)).toBeGreaterThanOrEqual(15);
  });

  it("rebuilds downtown: some buildings are demolished for bigger ones", () => {
    expect(voxels.some((v) => v.until !== undefined && v.until < 1)).toBe(true);
  });

  it("has a few roads open from the start and many by the end", () => {
    const open = (p: number) => lanes.filter((l) => l.t <= p).length;
    expect(open(0.05)).toBeGreaterThan(0);
    expect(open(1)).toBeGreaterThan(open(0.05) * 3);
  });
});

describe("Ancient Temple", () => {
  const voxels = THEMES.temple.generate(5);
  const tallest = (p: number) => Math.max(...voxels.filter((v) => isVisible(v, p)).map((v) => v.y));

  it("starts as low ruins and ends with a tall sanctuary tower", () => {
    expect(tallest(0)).toBeLessThanOrEqual(7);
    expect(tallest(1)).toBeGreaterThanOrEqual(15);
  });

  it("replaces the mossy ruins as the temple is restored", () => {
    expect(voxels.filter((v) => v.t === 0 && v.until !== undefined).length).toBeGreaterThan(100);
  });
});
