import { generateBonsai } from "./bonsai";
import { generateCity } from "./city";
import type { Voxel } from "./voxel";

export type ThemeKey = "bonsai" | "city";

export interface Theme {
  key: ThemeKey;
  name: string;
  /** Names for the five growth stages, from first to completion. */
  stages: [string, string, string, string, string];
  blurb: string;
  generate: (seed: number) => Voxel[];
}

export const THEMES: Record<ThemeKey, Theme> = {
  bonsai: {
    key: "bonsai",
    name: "Bonsai Garden",
    stages: ["Seed", "Sprout", "Sapling", "Trained Bonsai", "Master Bonsai"],
    blurb: "A tree that grows with mindfulness and consistency.",
    generate: generateBonsai,
  },
  city: {
    key: "city",
    name: "Voxel City",
    stages: ["Camp", "Village", "Town", "City", "Megacity"],
    blurb: "A settlement that grows with every walk and stretch.",
    generate: generateCity,
  },
};

/** Worlds from the scope that are planned but not built yet. */
export const UPCOMING = ["Ancient Temple", "Space Colony", "Companion Creature"];

export const isThemeKey = (k: unknown): k is ThemeKey => typeof k === "string" && k in THEMES;
export const themeOf = (k: string | undefined) => THEMES[isThemeKey(k) ? k : "bonsai"];
