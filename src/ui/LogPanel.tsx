import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, SESSION_LENGTHS, pointsFor, type Activity, type CategoryKey } from "../game/activities";
import type { LogEntry } from "../game/stats";
import { SaveControls } from "./SaveControls";

interface Props {
  minutes: number;
  onMinutes: (m: number) => void;
  onLog: (activity: Activity, category: CategoryKey) => void;
  today: LogEntry[];
}

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function LogPanel({ minutes, onMinutes, onLog, today }: Props) {
  return (
    <aside id="log" className="flex min-h-0 flex-col border-t border-line bg-carbon-2 md:overflow-y-auto md:border-l md:border-t-0">
      <div className="px-4 pt-5 md:px-[22px] md:pt-[22px]">
        <h2 className="mb-1 font-display text-base font-medium">Log a moment</h2>
        <p className="mb-4 text-[13px] text-fg-3">Tap what you just did. Longer sessions earn more.</p>
        <div role="group" aria-label="Session length" className="mb-[18px] grid grid-cols-4 gap-1 rounded-[10px] bg-slate p-1">
          {SESSION_LENGTHS.map((m) => (
            <button
              key={m}
              aria-pressed={m === minutes}
              onClick={() => onMinutes(m)}
              className="rounded-[7px] py-[7px] font-data text-[13px] text-fg-2 aria-pressed:bg-slate-2 aria-pressed:text-fg aria-pressed:shadow-[inset_0_0_0_1px_#2a3337]"
            >
              {m}m
            </button>
          ))}
        </div>
        {CATEGORIES.map((c) => (
          <div key={c.key} className="mb-4">
            <div className="label mb-2 flex items-center gap-2">
              <i className="inline-block h-1.5 w-1.5 rounded-[2px]" style={{ background: c.color }} />
              {c.name}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {c.activities.map((a) => (
                <button
                  key={a.name}
                  onClick={() => onLog(a, c.key)}
                  className="flex items-center justify-between gap-1.5 rounded-lg border border-transparent bg-slate px-2.5 py-[9px] text-left text-[13px] transition hover:border-emerald-dim hover:bg-[#1b2226] active:scale-[.98]"
                >
                  <span className="min-w-0 truncate">{a.name}</span>
                  <span className="whitespace-nowrap font-data text-[11.5px] text-emerald">+{pointsFor(a, minutes)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 pb-6 pt-1.5 md:px-[22px] md:pb-[22px]">
        <div className="mb-2.5 flex items-baseline justify-between border-t border-line pt-[18px]">
          <span className="label">Today</span>
          <span className="num text-xs text-fg-2">{today.length} logged</span>
        </div>
        {today.length === 0 ? (
          <p className="py-2 text-[13px] text-fg-3">Nothing logged yet today. A two-minute stretch counts.</p>
        ) : (
          <ul className="grid gap-0.5">
            <AnimatePresence initial={false}>
              {[...today].reverse().map((e) => (
                <motion.li
                  key={e.id}
                  initial={{ backgroundColor: "rgba(67,211,154,.12)" }}
                  animate={{ backgroundColor: "rgba(67,211,154,0)" }}
                  transition={{ duration: 1.2 }}
                  className="grid grid-cols-[44px_1fr_auto] items-baseline gap-2.5 py-[7px] text-[13px] text-fg-2"
                >
                  <span className="font-data text-[11.5px] text-fg-3">{time(e.at)}</span>
                  <span>
                    {e.activity}
                    {e.minutes && <span className="text-fg-3"> · {e.minutes} min</span>}
                  </span>
                  <span className="font-data text-xs text-emerald">+{e.points}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        <div className="mt-5">
          <SaveControls />
        </div>
      </div>
    </aside>
  );
}
