import { useRef, useState } from "react";
import { parseSave, serializeSave, type SaveData } from "../game/save";
import { useSanctuary } from "../game/store";

/** Export the save as a JSON file, or import one (with an in-page confirmation before replacing progress). */
export function SaveControls() {
  const loadSave = useSanctuary((s) => s.loadSave);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<SaveData | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const exportSave = () => {
    const { entries, world, keepsakes } = useSanctuary.getState();
    const blob = new Blob([serializeSave({ entries, world, keepsakes })], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `voxel-sanctuary-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage({ tone: "ok", text: "Save exported." });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPending(parseSave(await file.text()));
      setMessage(null);
    } catch (e) {
      setMessage({ tone: "error", text: (e as Error).message });
    }
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <div className="border-t border-line pt-[18px]">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="label">Your save</span>
        <span className="text-xs text-fg-3">Stored in this browser</span>
      </div>
      {pending ? (
        <div className="grid gap-2.5 rounded-lg border border-gold-dim bg-[#1a1710] p-3 text-[13px]">
          <p className="text-fg-2">
            Replace your current progress with this save? It has {pending.entries.length} logged moments, world {pending.world.number} and{" "}
            {pending.keepsakes.length} {pending.keepsakes.length === 1 ? "keepsake" : "keepsakes"}.
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-gold px-3 py-1.5 font-semibold text-carbon hover:brightness-110"
              onClick={() => {
                loadSave(pending);
                setPending(null);
                setMessage({ tone: "ok", text: "Save imported." });
              }}
            >
              Replace progress
            </button>
            <button className="ghost" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          <button className="ghost justify-center" onClick={exportSave}>
            Export save
          </button>
          <button className="ghost justify-center" onClick={() => fileInput.current?.click()}>
            Import save
          </button>
          <input id="import-save" ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      )}
      {message && (
        <p role="status" className={`mt-2 text-[12.5px] ${message.tone === "error" ? "text-[#f08a7a]" : "text-emerald"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
