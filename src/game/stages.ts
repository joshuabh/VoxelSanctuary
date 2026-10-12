export const WORLD_GOAL = 1000;

/** WP at which each of a world's five stages begins; every theme shares them. */
export const STAGE_AT = [0, 100, 300, 600, 1000] as const;

export function stageIndex(wp: number): number {
  let i = 0;
  STAGE_AT.forEach((at, k) => {
    if (wp >= at) i = k;
  });
  return i;
}

/** World growth progress in 0..1. */
export const progressOf = (wp: number) => Math.min(Math.max(wp, 0), WORLD_GOAL) / WORLD_GOAL;
