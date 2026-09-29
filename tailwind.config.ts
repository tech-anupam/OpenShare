import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        surface: {
          light: "#fafafa",
          dark: "#0a0a0a",
        },
        card: {
          light: "#ffffff",
          dark: "#141414",
        },
        border: {
          light: "#e5e5e5",
          dark: "#262626",
        },
        muted: {
          light: "#737373",
          dark: "#a3a3a3",
        },
      },
    },
  },
  plugins: [],
};

export default config;
