import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F6F2",
        ink: "#1B2430",
        "ink-soft": "#4A5568",
        line: "#DCD9D0",
        accent: "#346296", // The Prewitt Group brand blue, sampled from the logo
        "accent-soft": "#E7ECF2",
        stamp: "#993C1D", // used sparingly, e.g. "unsaved changes" indicator
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
