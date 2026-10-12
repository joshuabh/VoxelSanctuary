import { describe, expect, it } from "vitest";
import { parseSave, serializeSave, type SaveData } from "./save";

const data: SaveData = {
  entries: [{ id: "a", at: "2026-10-10T09:00:00.000Z", activity: "Walking", category: "physical", minutes: 20, points: 37 }],
  world: { seed: 123, theme: "bonsai", number: 2, startedAt: "2026-10-01T09:00:00.000Z" },
  keepsakes: [{ seed: 9, theme: "bonsai", startedAt: "2026-09-01T09:00:00.000Z", completedAt: "2026-09-20T09:00:00.000Z", points: 1004 }],
};

describe("save files", () => {
  it("round-trips a save", () => {
    expect(parseSave(serializeSave(data))).toEqual(data);
  });
  it("rejects files that aren't saves", () => {
    expect(() => parseSave("not json")).toThrow(/isn't a Voxel Sanctuary save/);
    expect(() => parseSave(JSON.stringify({ hello: 1 }))).toThrow(/isn't a Voxel Sanctuary save/);
  });
  it("rejects saves from a newer version", () => {
    const newer = JSON.parse(serializeSave(data));
    newer.version = 99;
    expect(() => parseSave(JSON.stringify(newer))).toThrow(/newer version/);
  });
  it("rejects damaged saves", () => {
    const broken = JSON.parse(serializeSave(data));
    broken.entries[0].points = "lots";
    expect(() => parseSave(JSON.stringify(broken))).toThrow(/damaged/);
  });
});
