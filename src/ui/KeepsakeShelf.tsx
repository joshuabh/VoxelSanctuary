import { useEffect, useState } from "react";
import type { Keepsake } from "../game/store";
import { renderStill } from "../world/still";

const thumbCache = new Map<number, string>();

function Thumb({ keepsake, index }: { keepsake: Keepsake; index: number }) {
  const [src, setSrc] = useState(() => thumbCache.get(keepsake.seed));
  useEffect(() => {
    if (src) return;
    const t = setTimeout(() => {
      const url = renderStill(keepsake.seed, 320, 400, { background: 0x121a1c, rotation: index % 2 ? -1.1 : 0.6, pad: 0.72 });
      thumbCache.set(keepsake.seed, url);
      setSrc(url);
    }, 200 + index * 150);
    return () => clearTimeout(t);
  }, [keepsake.seed, index, src]);

  const done = new Date(keepsake.completedAt);
  const days = Math.max(1, Math.round((done.getTime() - new Date(keepsake.startedAt).getTime()) / 86_400_000));
  return (
    <figure className="relative m-0 aspect-[4/5] max-w-full overflow-hidden rounded-[10px] border border-line bg-slate">
      {src && <img src={src} alt={`Completed bonsai keepsake, world ${index + 1}`} className="block h-full w-full object-cover" />}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-carbon/90 to-transparent px-2 pb-1.5 pt-[18px] text-[10.5px] leading-tight text-fg-2">
        <b className="block text-[11.5px] font-semibold text-fg">World {index + 1}</b>
        {done.toLocaleDateString("en-GB", { month: "short", year: "numeric" })} · {days} {days === 1 ? "day" : "days"}
      </figcaption>
    </figure>
  );
}

export function KeepsakeShelf({ keepsakes }: { keepsakes: Keepsake[] }) {
  const recent = keepsakes.slice(-2);
  return (
    <div className="card md:col-span-2 xl:col-span-1" id="keepsakes">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="label">Keepsakes</span>
        <span className="label">{keepsakes.length} saved</span>
      </div>
      <div className="grid grid-cols-3 gap-2 md:max-w-[440px] xl:max-w-none">
        {recent.map((k) => (
          <Thumb key={k.seed + k.completedAt} keepsake={k} index={keepsakes.indexOf(k)} />
        ))}
        <div className="grid aspect-[4/5] place-items-center rounded-[10px] border border-dashed border-line p-2 text-center text-[11.5px] text-fg-3">
          This world joins the shelf at Master Bonsai
        </div>
      </div>
    </div>
  );
}
