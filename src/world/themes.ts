import { generateBonsai } from "./bonsai";
import { cityLanes, generateCity, type Lane } from "./city";
import { generateTemple } from "./temple";
import type { Voxel } from "./voxel";

export type ThemeKey = "bonsai" | "city" | "temple";

export interface Theme {
  key: ThemeKey;
  name: string;
  /** Names for the five growth stages, from first to completion. */
  stages: [string, string, string, string, string];
  blurb: string;
  generate: (seed: number) => Voxel[];
  /** How much bigger than the bonsai island this world is; scales the camera framing. */
  frame: number;
  /** Roads for the moving-traffic layer, when the world has any. */
  lanes?: (seed: number) => Lane[];
}

export const THEMES: Record<ThemeKey, Theme> = {
  bonsai: {
    key: "bonsai",
    name: "Bonsai Garden",
    stages: ["Seed", "Sprout", "Sapling", "Trained Bonsai", "Master Bonsai"],
    blurb: "A tree that grows with mindfulness and consistency.",
    generate: generateBonsai,
    frame: 1,
  },
  city: {
    key: "city",
    name: "Voxel City",
    stages: ["Country Town", "Suburbs", "City", "Downtown", "Metropolis"],
    blurb: "A country town that grows into a skyscraper metropolis, traffic and all.",
    generate: generateCity,
    frame: 1.25,
    lanes: cityLanes,
  },
  temple: {
    key: "temple",
    name: "Ancient Temple",
    stages: ["Overgrown Ruins", "Cleared Grounds", "Restored Terraces", "Temple Complex", "Grand Sanctuary"],
    blurb: "Jungle ruins you uncover and rebuild into a golden stepped temple.",
    generate: generateTemple,
    frame: 1.12,
  },
};

/** Worlds from the scope that are planned but not built yet. */
export const UPCOMING = ["Space Colony", "Companion Creature"];

export const isThemeKey = (k: unknown): k is ThemeKey => typeof k === "string" && k in THEMES;
export const themeOf = (k: string | undefined) => THEMES[isThemeKey(k) ? k : "bonsai"];
