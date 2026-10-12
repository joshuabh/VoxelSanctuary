import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { renderStill } from "../world/still";
import { themeOf, type ThemeKey } from "../world/themes";
import { seedLabel } from "./WorldPanel";

const W = 1920, H = 1080;

/** Composes the wallpaper: the fully grown world plus a quiet caption. */
function composeWallpaper(theme: ThemeKey, seed: number, worldNumber: number, rotation: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const grad = g.createRadialGradient(W * 0.5, H * 0.45, 100, W * 0.5, H * 0.5, W * 0.7);
      grad.addColorStop(0, "rgba(67,211,154,0.06)");
      grad.addColorStop(1, "rgba(0,0,0,0.45)");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#e8c26a";
      g.fillRect(96, H - 176, 40, 3);
      g.fillStyle = "#e6ece9";
      g.font = "500 34px Unbounded, sans-serif";
      g.fillText(themeOf(theme).name, 96, H - 132);
      g.fillStyle = "#9aa8a3";
      g.font = "400 20px Manrope, sans-serif";
      g.fillText(`World ${worldNumber}  ·  Seed ${seedLabel(seed)}`, 96, H - 92);
      resolve(c.toDataURL("image/jpeg", 0.92));
    };
    img.src = renderStill(theme, seed, W, H, { background: 0x0d1213, rotation, pad: 0.85, lift: 0.08 });
  });
}

export function WallpaperModal({ theme, seed, worldNumber, rotation, onClose }: { theme: ThemeKey; seed: number; worldNumber: number; rotation: number; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    composeWallpaper(theme, seed, worldNumber, rotation).then((url) => live && setSrc(url));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      live = false;
      removeEventListener("keydown", onKey);
    };
  }, [theme, seed, worldNumber, rotation, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 grid place-items-center bg-[rgba(5,6,7,.78)] px-4 py-6 backdrop-blur"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-label="Wallpaper preview"
    >
      <div className="grid w-full max-w-[960px] gap-3.5">
        {src ? (
          <img src={src} alt={`Wallpaper preview of the fully grown ${themeOf(theme).name}`} className="block w-full rounded-[14px] border border-line" />
        ) : (
          <div className="grid aspect-video place-items-center rounded-[14px] border border-line bg-carbon-2 text-fg-3">Rendering…</div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-fg-2">
          <span>Desktop wallpaper, shown as this world will look at {themeOf(theme).stages[4]}.</span>
          <div className="flex gap-2">
            {src && (
              <a className="ghost" href={src} download={`voxel-sanctuary-world-${worldNumber}.jpg`}>
                Download
              </a>
            )}
            <button className="ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
