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
        accent: "#0F6E56", // deep teal — trust + "verified" without being a stock blue
        "accent-soft": "#E1F5EE",
        stamp: "#993C1D", // used sparingly, e.g. "unsaved changes" indicator
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
  },
  plugins: [],
} satisfies Config;
