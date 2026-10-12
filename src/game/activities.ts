export type CategoryKey = "mental" | "physical" | "health" | "work";

export interface Activity {
  name: string;
  base: number;
  /** Fixed-value activities ignore session length. */
  fixed?: boolean;
}

export interface Category {
  key: CategoryKey;
  name: string;
  color: string;
  activities: Activity[];
}

export const CATEGORIES: Category[] = [
  {
    key: "mental",
    name: "Mental",
    color: "#8fe6ee",
    activities: [
      { name: "Breathwork", base: 5 },
      { name: "Meditation", base: 10 },
      { name: "Mindfulness", base: 10 },
      { name: "Gratitude", base: 8 },
    ],
  },
  {
    key: "physical",
    name: "Physical",
    color: "#43d39a",
    activities: [
      { name: "Stretching", base: 15 },
      { name: "Walking", base: 25 },
      { name: "Exercise", base: 50 },
      { name: "Standing break", base: 5 },
    ],
  },
  {
    key: "health",
    name: "Health",
    color: "#e8c26a",
    activities: [
      { name: "Hydration", base: 5, fixed: true },
      { name: "Sunlight", base: 20, fixed: true },
      { name: "Healthy meal", base: 10, fixed: true },
      { name: "Sleep log", base: 10, fixed: true },
    ],
  },
  {
    key: "work",
    name: "Workplace",
    color: "#b9a6f0",
    activities: [
      { name: "Micro-break", base: 5 },
      { name: "Desk reset", base: 6 },
      { name: "Focus session", base: 12 },
      { name: "Digital detox", base: 15 },
    ],
  },
];

export const SESSION_LENGTHS = [5, 10, 20, 30] as const;

/** Base points plus a duration modifier (0.6 WP per minute) for timed activities. */
export function pointsFor(activity: Activity, minutes: number): number {
  return activity.fixed ? activity.base : activity.base + Math.round(minutes * 0.6);
}
