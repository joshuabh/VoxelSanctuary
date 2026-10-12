import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { IconStar } from "./icons";

export interface ToastMessage {
  id: number;
  title: string;
  body: string;
}

export function Toast({ toast, onDone }: { toast: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-4 top-5 z-20 flex justify-center">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center gap-3 rounded-xl border border-gold-dim bg-[#1a1710] py-3 pl-3.5 pr-[18px] shadow-[0_10px_40px_rgba(0,0,0,.5),0_0_30px_rgba(232,194,106,.12)]"
          >
            <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-gold-dim text-gold">
              <IconStar className="h-4 w-4" />
            </div>
            <div>
              <b className="block font-display text-sm font-medium text-gold">{toast.title}</b>
              <span className="text-[12.5px] text-fg-2">{toast.body}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
