/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0d10",
        surface: "#11161b",
        raised: "#182029",
        fg: "#e8eef2",
        muted: "#93a1ab",
        subtle: "#64727d",
        border: "#1f2a33",
        line: "#27c093",
        "line-fg": "#06110d",
        accent: "#4aa3ff",
        paper: "#f2f5f4",
        "paper-fg": "#0d1116",
        ink: "#0d1116",
        "ink-fg": "#e8eef2",
        ok: "#6fcf97",
        warn: "#e0b15c",
        danger: "#e0695f",
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
