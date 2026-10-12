import { isThemeKey } from "../world/themes";
import type { Keepsake, World } from "./store";
import type { LogEntry } from "./stats";

export const SAVE_APP = "voxel-sanctuary";
export const SAVE_VERSION = 1;

export interface SaveData {
  entries: LogEntry[];
  world: World;
  keepsakes: Keepsake[];
}

interface SaveFile extends SaveData {
  app: typeof SAVE_APP;
  version: number;
  exportedAt: string;
}

export function serializeSave(data: SaveData, now = new Date()): string {
  const file: SaveFile = { app: SAVE_APP, version: SAVE_VERSION, exportedAt: now.toISOString(), ...data };
  return JSON.stringify(file, null, 2);
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isEntry = (e: unknown) =>
  isObj(e) && typeof e.id === "string" && typeof e.at === "string" && typeof e.activity === "string" && typeof e.category === "string" && typeof e.points === "number";
const isWorld = (w: unknown) => isObj(w) && isThemeKey(w.theme) && typeof w.seed === "number" && typeof w.number === "number" && typeof w.startedAt === "string";
const isKeepsake = (k: unknown) => isObj(k) && isThemeKey(k.theme) && typeof k.seed === "number" && typeof k.completedAt === "string" && typeof k.startedAt === "string";

/** Parses a save file, throwing an Error with a readable message when it isn't one. */
export function parseSave(text: string): SaveData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a Voxel Sanctuary save. Choose a .json file exported from the app.");
  }
  if (!isObj(raw) || raw.app !== SAVE_APP) throw new Error("That file isn't a Voxel Sanctuary save. Choose a .json file exported from the app.");
  if (typeof raw.version !== "number" || raw.version > SAVE_VERSION) throw new Error("This save comes from a newer version of Voxel Sanctuary. Update the app, then import it again.");
  if (!Array.isArray(raw.entries) || !raw.entries.every(isEntry) || !isWorld(raw.world) || !Array.isArray(raw.keepsakes) || !raw.keepsakes.every(isKeepsake))
    throw new Error("This save file is damaged and can't be imported.");
  return { entries: raw.entries as LogEntry[], world: raw.world as World, keepsakes: raw.keepsakes as Keepsake[] };
}
