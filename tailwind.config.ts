import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crystal: {
          bg: "#F9F9F9",
          card: "#FFFFFF",
          border: "rgba(0, 0, 0, 0.15)",
          pill: "#C7C7CC",
          chip: "#BAE6FD",
          chipBorder: "#0284C7",
          status: {
            done: "#0066FF",
            partial: "#28A745",
            barely: "#E53E3E",
            untouched: "#1F2937",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "-apple-system", "sans-serif"],
        manrope: ["var(--font-manrope)", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
