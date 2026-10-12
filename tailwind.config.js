/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carbon: { DEFAULT: "#0b0d0e", 2: "#111416" },
        slate: { DEFAULT: "#181d20", 2: "#222a2e" },
        line: "#2a3337",
        fg: { DEFAULT: "#e6ece9", 2: "#9aa8a3", 3: "#66746f" },
        emerald: { DEFAULT: "#43d39a", dim: "#1f5c45" },
        cyan: "#8fe6ee",
        gold: { DEFAULT: "#e8c26a", dim: "#4d3f1f" },
        lilac: "#b9a6f0",
      },
      fontFamily: {
        display: ['"Unbounded"', '"Segoe UI"', "system-ui", "sans-serif"],
        body: ['"Manrope"', '"Segoe UI"', "system-ui", "sans-serif"],
        data: ['"JetBrains Mono"', "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
