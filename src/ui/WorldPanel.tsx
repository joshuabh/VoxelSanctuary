import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { BONSAI_STAGES, WORLD_GOAL, progressOf, stageIndex } from "../game/stages";
import { Scene } from "../world/Scene";
import { IconReplay, IconScreen } from "./icons";
import { WallpaperModal } from "./WallpaperModal";

const fmt = (n: number) => n.toLocaleString("en-GB");
export const seedLabel = (seed: number) => {
  const h = seed.toString(16).toUpperCase().padStart(6, "0");
  return `#${h.slice(0, 4)}-${h.slice(4)}`;
};

interface Props {
  seed: number;
  worldNumber: number;
  wp: number;
  /** Changes on every log so the "+WP" float replays. */
  lastGain: { id: string; points: number } | null;
  onComplete: () => void;
}

export function WorldPanel({ seed, worldNumber, wp, lastGain, onComplete }: Props) {
  const reduceMotion = !!useReducedMotion();
  const rotation = useRef(-0.35);
  const [replayRun, setReplayRun] = useState(0);
  const [replay, setReplay] = useState<number | null>(null);
  const [wallpaper, setWallpaper] = useState(false);
  const target = progressOf(wp);
  const si = stageIndex(wp);
  const next = BONSAI_STAGES[si + 1];
  const complete = wp >= WORLD_GOAL;

  // Replays growth from seed up to the current progress.
  useEffect(() => {
    if (!replayRun) return;
    let raf = 0;
    const t0 = performance.now() + 350;
    const dur = reduceMotion ? 1 : 5200;
    setReplay(0);
    const step = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0) / dur));
      setReplay(target * k);
      if (k < 1) raf = requestAnimationFrame(step);
      else setReplay(null);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [replayRun]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      id="world"
      aria-label="Your bonsai garden"
      className="world-bg relative mx-4 mt-3.5 h-[440px] flex-none touch-none overflow-hidden rounded-[20px] border border-line md:mx-7 md:mt-4 md:h-auto md:min-h-[460px] md:flex-1"
    >
      <Scene seed={seed} progress={replay ?? target} reduceMotion={reduceMotion} rotation={rotation} />

      <div className="absolute left-[18px] top-[18px] hidden text-xs text-fg-3 md:block">
        Seed <span className="num text-fg-2">{seedLabel(seed)}</span>
      </div>
      <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
        <button className="ghost" onClick={() => setReplayRun((n) => n + 1)} title="Replay this world's growth from seed">
          <IconReplay className="h-[15px] w-[15px]" />
          Replay growth
        </button>
        <button className="ghost" onClick={() => setWallpaper(true)} title="Preview the wallpaper this world becomes">
          <IconScreen className="h-[15px] w-[15px]" />
          Wallpaper
        </button>
      </div>

      <AnimatePresence>
        {lastGain && (
          <motion.div
            key={lastGain.id}
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: [0, 1, 0], y: -60, x: "-50%" }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[38%] font-display text-[22px] text-emerald [text-shadow:0_0_18px_rgba(67,211,154,.6)]"
          >
            +{lastGain.points} WP
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass absolute inset-x-4 bottom-4 grid gap-3 rounded-[14px] px-[18px] py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="font-display text-[15px] font-medium">{BONSAI_STAGES[si].name}</span>
          {complete ? (
            <button onClick={onComplete} className="rounded-lg bg-gold px-3 py-1.5 text-[13px] font-semibold text-carbon transition hover:brightness-110">
              Save keepsake and start world {worldNumber + 1}
            </button>
          ) : (
            <span className="text-[13px] text-fg-2">
              <strong className="num font-medium text-fg">{fmt(wp)}</strong> / <span className="num">{fmt(WORLD_GOAL)}</span> WP
              {next && ` · ${fmt(next.at - wp)} to ${next.name}`}
            </span>
          )}
        </div>
        <div className="relative h-1.5 rounded-md bg-slate-2">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-emerald-dim via-emerald via-70% to-cyan shadow-[0_0_14px_rgba(67,211,154,.45)] transition-[width] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ width: `${target * 100}%` }}
          />
          {BONSAI_STAGES.slice(1, -1).map((s) => (
            <i key={s.name} className="absolute -top-[3px] h-3 w-0.5 bg-carbon" style={{ left: `${(s.at / WORLD_GOAL) * 100}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {BONSAI_STAGES.map((s, i) => (
            <span
              key={s.name}
              className={`truncate ${i === 0 ? "text-left" : i === 4 ? "text-right" : "text-center"} ${
                i === si ? "font-semibold text-emerald" : i < si ? "text-fg-2" : "text-fg-3"
              }`}
            >
              {s.name.replace(" Bonsai", "")}
            </span>
          ))}
        </div>
      </div>

      {wallpaper && <WallpaperModal seed={seed} worldNumber={worldNumber} rotation={rotation.current} onClose={() => setWallpaper(false)} />}
    </section>
  );
}
