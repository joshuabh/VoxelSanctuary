import { useCallback, useMemo, useState } from "react";
import type { Activity, CategoryKey } from "./game/activities";
import { currentStreak, todayEntries, weekCategoryPoints, weekPoints } from "./game/stats";
import { useSanctuary, worldPoints } from "./game/store";
import { BalanceCard } from "./ui/BalanceCard";
import { KeepsakeShelf } from "./ui/KeepsakeShelf";
import { LogPanel } from "./ui/LogPanel";
import { Rail } from "./ui/Rail";
import { Toast, type ToastMessage } from "./ui/Toast";
import { WeekCard } from "./ui/WeekCard";
import { WorldPanel } from "./ui/WorldPanel";
import { themeOf } from "./world/themes";

export function App() {
  const { entries, world, keepsakes, sessionMinutes, setSessionMinutes, log, completeWorld, chooseTheme } = useSanctuary();
  const theme = themeOf(world.theme);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastGain, setLastGain] = useState<{ id: string; points: number } | null>(null);

  const wp = worldPoints({ entries, world });
  const today = useMemo(() => todayEntries(entries), [entries]);
  const week = useMemo(() => weekPoints(entries), [entries]);
  const weekCats = useMemo(() => weekCategoryPoints(entries), [entries]);
  const streak = useMemo(() => currentStreak(entries), [entries]);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const started = new Date(world.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  const onLog = useCallback(
    (activity: Activity, category: CategoryKey) => {
      const { entry, milestone } = log(activity, category);
      setLastGain({ id: entry.id, points: entry.points });
      if (milestone?.kind === "complete") setToast({ id: Date.now(), title: "World complete", body: "Save it to your keepsake shelf whenever you're ready." });
      else if (milestone) setToast({ id: Date.now(), title: `${themeOf(useSanctuary.getState().world.theme).stages[milestone.stage]} reached`, body: "New growth unlocked in your world." });
    },
    [log],
  );
  const clearToast = useCallback(() => setToast(null), []);

  return (
    <div className="grid min-h-full grid-cols-1 md:h-full md:min-h-[640px] md:grid-cols-[68px_minmax(0,1fr)_320px] xl:grid-cols-[68px_minmax(0,1fr)_360px]">
      <Rail />

      <main className="flex min-h-0 min-w-0 flex-col md:overflow-y-auto">
        <header className="flex flex-wrap items-center justify-between gap-4 px-4 pt-4 md:px-7 md:pt-5">
          <div>
            <div className="label">
              World {world.number} · Started {started}
            </div>
            <h1 className="mt-0.5 text-balance font-display text-[22px] font-medium tracking-[-0.01em]">{theme.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill dot="emerald" value={week[todayIndex]} label="WP today" />
            <Pill dot="gold" value={streak} label="day streak" />
          </div>
        </header>

        <WorldPanel
          theme={theme.key}
          seed={world.seed}
          worldNumber={world.number}
          wp={wp}
          lastGain={lastGain}
          onComplete={completeWorld}
          onChooseTheme={chooseTheme}
        />

        <section id="stats" className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:px-7 md:pb-7 xl:grid-cols-[1.4fr_1fr_1fr]">
          <WeekCard points={week} todayIndex={todayIndex} />
          <BalanceCard points={weekCats} />
          <KeepsakeShelf keepsakes={keepsakes} finalStage={theme.stages[4]} />
        </section>
      </main>

      <LogPanel minutes={sessionMinutes} onMinutes={setSessionMinutes} onLog={onLog} today={today} />
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}

function Pill({ dot, value, label }: { dot: "emerald" | "gold"; value: number; label: string }) {
  const color = dot === "emerald" ? "bg-emerald shadow-[0_0_10px_#43d39a]" : "bg-gold shadow-[0_0_10px_#e8c26a]";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-carbon-2 px-3 py-[7px] text-[13px] text-fg-2">
      <i className={`h-[7px] w-[7px] rounded-full ${color}`} />
      <strong className="num font-semibold text-fg">{value}</strong> {label}
    </span>
  );
}
