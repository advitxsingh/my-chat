import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: {
          DEFAULT: "#0a0a0a",
          secondary: "#121212",
          tertiary: "#181818",
          hover: "#1f1f1f",
        },
        border: {
          subtle: "#1c1c1c",
          DEFAULT: "#262626",
          active: "#3f3f46",
        },
        content: {
          DEFAULT: "#ededed",
          muted: "#888888",
          subtle: "#555555",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
