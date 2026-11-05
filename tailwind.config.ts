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
        // Semantic Design Tokens mapped to CSS Custom Properties
        background: "var(--background)",
        foreground: {
          DEFAULT: "var(--foreground)",
          subtle: "var(--foreground-subtle)",
          muted: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--foreground)",
        },
        subtle: {
          DEFAULT: "var(--subtle)",
          foreground: "var(--foreground-subtle)",
          hover: "var(--hover)",
          active: "var(--active)",
        },
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          subtle: "var(--accent-subtle)",
          border: "var(--accent-border)",
        },
        muted: {
          DEFAULT: "var(--subtle)",
          foreground: "var(--muted-foreground)",
        },
        status: {
          done: {
            bg: "var(--status-done-bg)",
            fg: "var(--status-done-fg)",
            border: "var(--status-done-border)",
          },
          partial: {
            bg: "var(--status-partial-bg)",
            fg: "var(--status-partial-fg)",
            border: "var(--status-partial-border)",
          },
          barely: {
            bg: "var(--status-barely-bg)",
            fg: "var(--status-barely-fg)",
            border: "var(--status-barely-border)",
          },
          untouched: {
            bg: "var(--status-untouched-bg)",
            fg: "var(--status-untouched-fg)",
            border: "var(--status-untouched-border)",
          },
        },
        crystal: {
          bg: "var(--background)",
          card: "var(--card)",
          border: "var(--border)",
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
