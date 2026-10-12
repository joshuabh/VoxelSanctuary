import { describe, expect, it } from "vitest";
import { CATEGORIES, pointsFor } from "./activities";
import { stageIndex } from "./stages";
import { currentStreak, weekPoints, type LogEntry } from "./stats";

const find = (name: string) => CATEGORIES.flatMap((c) => c.activities).find((a) => a.name === name)!;
const entry = (at: string, points = 10): LogEntry => ({ id: at, at, activity: "Walking", category: "physical", minutes: 10, points });

describe("points", () => {
  it("adds a duration modifier to timed activities", () => {
    expect(pointsFor(find("Walking"), 20)).toBe(37);
  });
  it("ignores duration for fixed activities", () => {
    expect(pointsFor(find("Sunlight"), 30)).toBe(20);
  });
});

describe("stages", () => {
  it("maps points to bonsai stages", () => {
    expect([0, 99, 100, 412, 600, 1200].map(stageIndex)).toEqual([0, 0, 1, 2, 3, 4]);
  });
});

describe("stats", () => {
  const now = new Date(2026, 9, 11, 15); // Sunday 11 Oct 2026
  it("counts a streak ending today", () => {
    const es = [9, 10, 11].map((d) => entry(new Date(2026, 9, d, 9).toISOString()));
    expect(currentStreak(es, now)).toBe(3);
  });
  it("keeps yesterday's streak alive before today's first log", () => {
    const es = [8, 9, 10].map((d) => entry(new Date(2026, 9, d, 9).toISOString()));
    expect(currentStreak(es, now)).toBe(3);
  });
  it("buckets points Monday to Sunday", () => {
    const es = [entry(new Date(2026, 9, 5, 9).toISOString(), 5), entry(new Date(2026, 9, 11, 9).toISOString(), 7), entry(new Date(2026, 9, 4, 9).toISOString(), 99)];
    expect(weekPoints(es, now)).toEqual([5, 0, 0, 0, 0, 0, 7]);
  });
});
