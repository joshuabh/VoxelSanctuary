import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pointsFor, type Activity, type CategoryKey } from "./activities";
import { WORLD_GOAL, stageIndex } from "./stages";
import type { LogEntry } from "./stats";

export interface Keepsake {
  seed: number;
  theme: "bonsai";
  startedAt: string;
  completedAt: string;
  points: number;
}

export interface World {
  seed: number;
  theme: "bonsai";
  number: number;
  startedAt: string;
}

export interface Milestone {
  kind: "stage" | "complete";
  stage: number;
}

interface SanctuaryState {
  entries: LogEntry[];
  world: World;
  keepsakes: Keepsake[];
  sessionMinutes: number;
  setSessionMinutes: (m: number) => void;
  /** Logs an activity and returns any milestone it crossed. */
  log: (activity: Activity, category: CategoryKey) => { entry: LogEntry; milestone: Milestone | null };
  /** Saves the finished world as a keepsake and starts a new one. */
  completeWorld: () => void;
}

const newSeed = () => (Math.random() * 0xffffff) | 0;
const newWorld = (number: number): World => ({ seed: newSeed(), theme: "bonsai", number, startedAt: new Date().toISOString() });

/** Wellbeing points earned since the current world started. */
export const worldPoints = (s: Pick<SanctuaryState, "entries" | "world">) =>
  s.entries.filter((e) => e.at >= s.world.startedAt).reduce((a, e) => a + e.points, 0);

export const useSanctuary = create<SanctuaryState>()(
  persist(
    (set, get) => ({
      entries: [],
      world: newWorld(1),
      keepsakes: [],
      sessionMinutes: 10,
      setSessionMinutes: (m) => set({ sessionMinutes: m }),
      log: (activity, category) => {
        const s = get();
        const before = worldPoints(s);
        const entry: LogEntry = {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          activity: activity.name,
          category,
          minutes: activity.fixed ? null : s.sessionMinutes,
          points: pointsFor(activity, s.sessionMinutes),
        };
        set({ entries: [...s.entries, entry] });
        const after = before + entry.points;
        const [a, b] = [stageIndex(before), stageIndex(after)];
        let milestone: Milestone | null = null;
        if (before < WORLD_GOAL && after >= WORLD_GOAL) milestone = { kind: "complete", stage: b };
        else if (b > a) milestone = { kind: "stage", stage: b };
        return { entry, milestone };
      },
      completeWorld: () => {
        const s = get();
        const keepsake: Keepsake = {
          seed: s.world.seed,
          theme: s.world.theme,
          startedAt: s.world.startedAt,
          completedAt: new Date().toISOString(),
          points: worldPoints(s),
        };
        set({ keepsakes: [...s.keepsakes, keepsake], world: newWorld(s.world.number + 1) });
      },
    }),
    { name: "voxel-sanctuary", version: 1 },
  ),
);
