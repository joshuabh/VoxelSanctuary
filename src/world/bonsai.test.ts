import { describe, expect, it } from "vitest";
import { generateBonsai, isVisible } from "./bonsai";

describe("generateBonsai", () => {
  it("regrows the same world from the same seed", () => {
    expect(generateBonsai(42)).toEqual(generateBonsai(42));
  });

  it("grows different worlds from different seeds", () => {
    expect(generateBonsai(1)).not.toEqual(generateBonsai(2));
  });

  it("never places two voxels in the same cell", () => {
    const cells = generateBonsai(7).filter((v) => !v.isSeed).map((v) => `${v.x},${v.y},${v.z}`);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it("adds voxels at every stage and shows everything at completion", () => {
    const world = generateBonsai(99);
    const count = (p: number) => world.filter((v) => isVisible(v, p)).length;
    const stages = [0, 0.1, 0.3, 0.6, 1];
    for (let i = 1; i < stages.length; i++) expect(count(stages[i])).toBeGreaterThan(count(stages[i - 1]));
    expect(count(1)).toBe(world.length - 1); // all but the seed
  });
});
