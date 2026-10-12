export const WORLD_GOAL = 1000;

export const BONSAI_STAGES = [
  { name: "Seed", at: 0 },
  { name: "Sprout", at: 100 },
  { name: "Sapling", at: 300 },
  { name: "Trained Bonsai", at: 600 },
  { name: "Master Bonsai", at: 1000 },
] as const;

export function stageIndex(wp: number): number {
  let i = 0;
  BONSAI_STAGES.forEach((s, k) => {
    if (wp >= s.at) i = k;
  });
  return i;
}

/** World growth progress in 0..1. */
export const progressOf = (wp: number) => Math.min(Math.max(wp, 0), WORLD_GOAL) / WORLD_GOAL;
