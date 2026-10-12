import { describe, expect, it } from "vitest";
import { THEMES } from "./themes";
import { isVisible } from "./voxel";

describe.each(Object.values(THEMES))("$name generator", ({ generate }) => {
  it("regrows the same world from the same seed", () => {
    expect(generate(42)).toEqual(generate(42));
  });

  it("grows different worlds from different seeds", () => {
    expect(generate(1)).not.toEqual(generate(2));
  });

  it("never places two voxels in the same cell", () => {
    const cells = generate(7).filter((v) => !v.isSeed).map((v) => `${v.x},${v.y},${v.z}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it("adds voxels at every stage and shows everything at completion", () => {
    for (const seed of [3, 99, 2024]) {
      const world = generate(seed);
      const count = (p: number) => world.filter((v) => isVisible(v, p)).length;
      const stages = [0, 0.1, 0.3, 0.6, 1];
      for (let i = 1; i < stages.length; i++) expect(count(stages[i])).toBeGreaterThan(count(stages[i - 1]));
      expect(count(1)).toBe(world.filter((v) => !v.isSeed).length);
    }
  });
});
