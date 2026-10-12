import { motion } from "framer-motion";
import { useEffect } from "react";
import { THEMES, UPCOMING, type ThemeKey } from "../world/themes";

interface Props {
  current: ThemeKey;
  /** True when choosing the next world after completing one. */
  completing: boolean;
  worldNumber: number;
  onPick: (theme: ThemeKey) => void;
  onClose: () => void;
}

export function WorldChooser({ current, completing, worldNumber, onPick, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-10 grid place-items-center bg-carbon/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-label="Choose a world"
    >
      <div className="glass grid w-full max-w-[420px] gap-3 rounded-[14px] p-5">
        <div>
          <div className="label">{completing ? "World complete" : `World ${worldNumber}`}</div>
          <h2 className="mt-1 font-display text-base font-medium">{completing ? `Choose world ${worldNumber}` : "Choose your world"}</h2>
        </div>
        <div className="grid gap-2">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.key}
              onClick={() => onPick(t.key)}
              className="grid gap-0.5 rounded-lg border border-line bg-slate px-3.5 py-3 text-left transition hover:border-emerald-dim hover:bg-[#1b2226]"
            >
              <span className="flex items-center justify-between gap-2 text-[13.5px] font-semibold">
                {t.name}
                {!completing && t.key === current && <span className="label !text-emerald">Current</span>}
              </span>
              <span className="text-[12.5px] text-fg-2">{t.blurb}</span>
              <span className="text-[11.5px] text-fg-3">{t.stages.join(" · ")}</span>
            </button>
          ))}
          {UPCOMING.map((n) => (
            <div key={n} className="flex items-center justify-between rounded-lg border border-dashed border-line px-3.5 py-2.5 text-[13px] text-fg-3">
              {n}
              <span className="label">Coming soon</span>
            </div>
          ))}
        </div>
        <button className="ghost justify-self-end" onClick={onClose}>
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
