import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { STAGE_AT, WORLD_GOAL, progressOf, stageIndex } from "../game/stages";
import { Scene } from "../world/Scene";
import { themeOf, type ThemeKey } from "../world/themes";
import { IconReplay, IconScreen, IconWorld } from "./icons";
import { WorldChooser } from "./WorldChooser";
import { WallpaperModal } from "./WallpaperModal";

const fmt = (n: number) => n.toLocaleString("en-GB");
export const seedLabel = (seed: number) => {
  const h = seed.toString(16).toUpperCase().padStart(6, "0");
  return `#${h.slice(0, 4)}-${h.slice(4)}`;
};

interface Props {
  theme: ThemeKey;
  seed: number;
  worldNumber: number;
  wp: number;
  /** Changes on every log so the "+WP" float replays. */
  lastGain: { id: string; points: number } | null;
  /** Saves the finished world and starts the next one with the chosen theme. */
  onComplete: (next: ThemeKey) => void;
  /** Swaps the theme of a world that has no points yet. */
  onChooseTheme: (theme: ThemeKey) => void;
}

export function WorldPanel({ theme, seed, worldNumber, wp, lastGain, onComplete, onChooseTheme }: Props) {
  const reduceMotion = !!useReducedMotion();
  const rotation = useRef(-0.35);
  const [replayRun, setReplayRun] = useState(0);
  const [replay, setReplay] = useState<number | null>(null);
  const [wallpaper, setWallpaper] = useState(false);
  const [chooser, setChooser] = useState(false);
  const { name, stages } = themeOf(theme);
  const target = progressOf(wp);
  const si = stageIndex(wp);
  const nextAt = STAGE_AT[si + 1];
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
      aria-label={`Your ${name}`}
      className="world-bg relative mx-4 mt-3.5 h-[440px] flex-none touch-none overflow-hidden rounded-[20px] border border-line md:mx-7 md:mt-4 md:h-auto md:min-h-[460px] md:flex-1"
    >
      <Scene theme={theme} seed={seed} progress={replay ?? target} reduceMotion={reduceMotion} rotation={rotation} />

      <div className="absolute left-[18px] top-[18px] hidden text-xs text-fg-3 md:block">
        Seed <span className="num text-fg-2">{seedLabel(seed)}</span>
      </div>
      <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
        {wp === 0 && (
          <button className="ghost" onClick={() => setChooser(true)} title="Pick a different world before you start growing">
            <IconWorld className="h-[15px] w-[15px]" />
            Change world
          </button>
        )}
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
          <span className="font-display text-[15px] font-medium">{stages[si]}</span>
          {complete ? (
            <button onClick={() => setChooser(true)} className="rounded-lg bg-gold px-3 py-1.5 text-[13px] font-semibold text-carbon transition hover:brightness-110">
              Save keepsake and choose world {worldNumber + 1}
            </button>
          ) : (
            <span className="text-[13px] text-fg-2">
              <strong className="num font-medium text-fg">{fmt(wp)}</strong> / <span className="num">{fmt(WORLD_GOAL)}</span> WP
              {nextAt !== undefined && ` · ${fmt(nextAt - wp)} to ${stages[si + 1]}`}
            </span>
          )}
        </div>
        <div className="relative h-1.5 rounded-md bg-slate-2">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-emerald-dim via-emerald via-70% to-cyan shadow-[0_0_14px_rgba(67,211,154,.45)] transition-[width] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ width: `${target * 100}%` }}
          />
          {STAGE_AT.slice(1, -1).map((at) => (
            <i key={at} className="absolute -top-[3px] h-3 w-0.5 bg-carbon" style={{ left: `${(at / WORLD_GOAL) * 100}%` }} />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {stages.map((s, i) => (
            <span
              key={s}
              className={`truncate ${i === 0 ? "text-left" : i === 4 ? "text-right" : "text-center"} ${
                i === si ? "font-semibold text-emerald" : i < si ? "text-fg-2" : "text-fg-3"
              }`}
            >
              {s.replace(" Bonsai", "")}
            </span>
          ))}
        </div>
      </div>

      {chooser && (
        <WorldChooser
          current={theme}
          completing={complete}
          worldNumber={complete ? worldNumber + 1 : worldNumber}
          onPick={(t) => {
            setChooser(false);
            if (complete) onComplete(t);
            else onChooseTheme(t);
          }}
          onClose={() => setChooser(false)}
        />
      )}
      {wallpaper && <WallpaperModal theme={theme} seed={seed} worldNumber={worldNumber} rotation={rotation.current} onClose={() => setWallpaper(false)} />}
    </section>
  );
}
