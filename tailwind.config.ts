import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#08051A",
        surface: "#141219",
        "surface-dim": "#141219",
        "surface-bright": "#3b383f",
        "surface-container-lowest": "#0f0d14",
        "surface-container-low": "#1d1a21",
        "surface-container": "#211e25",
        "surface-container-high": "#2b2930",
        "surface-container-highest": "#36343b",
        "on-surface": "#e6e0ea",
        "on-surface-variant": "#cac4d4",
        "on-background": "#e6e0ea",
        "outline": "#948e9d",
        "outline-variant": "#494552",
        "primary": "#cebdff",
        "primary-container": "#a78bfa",
        "on-primary": "#381385",
        "on-primary-container": "#3c1989",
        "secondary": "#f3aeff",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "surface-variant": "#36343b",
        "surface-tint": "#cebdff",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
        fadeIn: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
        scanline: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(400%)" } },
      },
      animation: {
        pulse2: "pulse2 2s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        scanline: "scanline 3s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
