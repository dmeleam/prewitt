import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palette taken from the Prewitt Group benefits guide
        paper: "#FBFCFD",       // --cloud, page background
        ink: "#1A2430",         // --ink, primary text
        "ink-soft": "#4B5A6A",  // --ink-soft, secondary text
        line: "#DCE6EF",        // --line, borders
        accent: "#326195",      // --blue-primary
        "accent-deep": "#1D3A57", // --blue-deep
        "accent-soft": "#EAF2FA", // --sky-tint
        sand: "#E8A33D",        // --sand, warm highlight
        stamp: "#993C1D",       // destructive actions
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "system-ui", "sans-serif"],
        display: ["Georgia", "Iowan Old Style", "Times New Roman", "serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
      },
    },
  },
  plugins: [],
} satisfies Config;
