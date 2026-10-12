import { CATEGORIES, type CategoryKey } from "../game/activities";

export function BalanceCard({ points }: { points: Record<CategoryKey, number> }) {
  const max = Math.max(...Object.values(points), 1);
  const covered = CATEGORIES.filter((c) => points[c.key] > 0).length;
  return (
    <div className="card">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="label">Balance this week</span>
        <span className="label !text-gold" title="Balanced Life: log every category in one week">
          {covered === 4 ? "Balanced week" : `${covered} of 4`}
        </span>
      </div>
      <div className="grid gap-2.5">
        {CATEGORIES.map((c) => (
          <div key={c.key} className="grid grid-cols-[88px_1fr_34px] items-center gap-2.5 text-[13px] text-fg-2">
            <span>{c.name}</span>
            <div className="h-1.5 overflow-hidden rounded-md bg-slate-2">
              <i className="block h-full rounded-md transition-[width] duration-500" style={{ width: `${(points[c.key] / max) * 100}%`, background: c.color }} />
            </div>
            <span className="num text-right text-xs text-fg-3">{points[c.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
