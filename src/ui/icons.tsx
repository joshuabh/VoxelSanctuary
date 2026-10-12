const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconWorld = (p: { className?: string }) => (
  <svg {...base} {...p}><path d="M12 3 21 8v8l-9 5-9-5V8Z" /><path d="M12 13 21 8M12 13 3 8M12 13v8" /></svg>
);
export const IconPlus = (p: { className?: string }) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconStats = (p: { className?: string }) => (
  <svg {...base} {...p}><path d="M5 19V11M12 19V5M19 19v-6" /></svg>
);
export const IconGem = (p: { className?: string }) => (
  <svg {...base} {...p}><path d="M6 4h12l3 5-9 11L3 9Z" /><path d="M3 9h18M9 4l3 16 3-16" /></svg>
);
export const IconReplay = (p: { className?: string }) => (
  <svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
);
export const IconScreen = (p: { className?: string }) => (
  <svg {...base} {...p}><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
);
export const IconStar = (p: { className?: string }) => (
  <svg {...base} strokeWidth={2} {...p}><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7Z" /></svg>
);
export const Mark = (p: { className?: string }) => (
  <svg viewBox="0 0 34 34" aria-hidden="true" {...p}>
    <path d="M17 3 30 10.5v13L17 31 4 23.5v-13Z" fill="#162a22" stroke="#43d39a" strokeWidth="1.4" />
    <path d="M17 17 30 10.5M17 17 4 10.5M17 17v14" stroke="#43d39a" strokeWidth="1.4" opacity=".55" />
    <path d="M17 7.5 22.5 10.6 17 13.7 11.5 10.6Z" fill="#43d39a" />
  </svg>
);
