import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pointsFor, type Activity, type CategoryKey } from "./activities";
import { isThemeKey, type ThemeKey } from "../world/themes";
import { WORLD_GOAL, stageIndex } from "./stages";
import type { SaveData } from "./save";
import type { LogEntry } from "./stats";

export interface Keepsake {
  seed: number;
  theme: ThemeKey;
  startedAt: string;
  completedAt: string;
  points: number;
}

export interface World {
  seed: number;
  theme: ThemeKey;
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
  /** Saves the finished world as a keepsake and starts a new one with the chosen theme. */
  completeWorld: (next: ThemeKey) => void;
  /** Swaps the current world's theme; only allowed before it has earned any points. */
  chooseTheme: (theme: ThemeKey) => void;
  /** Replaces all progress with an imported save. */
  loadSave: (data: SaveData) => void;
}

const newSeed = () => (Math.random() * 0xffffff) | 0;
const newWorld = (number: number, theme: ThemeKey = "bonsai"): World => ({ seed: newSeed(), theme, number, startedAt: new Date().toISOString() });

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
      completeWorld: (next) => {
        const s = get();
        const keepsake: Keepsake = {
          seed: s.world.seed,
          theme: s.world.theme,
          startedAt: s.world.startedAt,
          completedAt: new Date().toISOString(),
          points: worldPoints(s),
        };
        set({ keepsakes: [...s.keepsakes, keepsake], world: newWorld(s.world.number + 1, next) });
      },
      chooseTheme: (theme) => {
        const s = get();
        if (worldPoints(s) > 0 || !isThemeKey(theme)) return;
        set({ world: { ...s.world, theme, seed: newSeed() } });
      },
      loadSave: ({ entries, world, keepsakes }) => set({ entries, world, keepsakes }),
    }),
    { name: "voxel-sanctuary", version: 1 },
  ),
);
