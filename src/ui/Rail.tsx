import { useState } from "react";
import { IconGem, IconPlus, IconStats, IconWorld, Mark } from "./icons";

const ITEMS = [
  { id: "world", title: "Sanctuary", Icon: IconWorld },
  { id: "log", title: "Log activity", Icon: IconPlus },
  { id: "stats", title: "Statistics", Icon: IconStats },
  { id: "keepsakes", title: "Keepsakes", Icon: IconGem },
];

export function Rail() {
  const [active, setActive] = useState("world");
  return (
    <nav aria-label="Sections" className="hidden flex-col items-center gap-1.5 border-r border-line bg-carbon-2 py-[18px] md:flex">
      <Mark className="mb-[18px] h-[34px] w-[34px]" />
      {ITEMS.map(({ id, title, Icon }) => (
        <button
          key={id}
          title={title}
          aria-current={active === id}
          onClick={() => {
            setActive(id);
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="grid h-11 w-11 place-items-center rounded-xl text-fg-3 transition-colors hover:bg-slate hover:text-fg aria-[current=true]:bg-slate aria-[current=true]:text-emerald"
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </nav>
  );
}
