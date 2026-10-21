import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        "nyaya-accent": "var(--nyaya-accent)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "surface-raised": "var(--surface-raised)",
        "surface-hover": "var(--surface-hover)",
        nyaya: {
          bg: "var(--nyaya-bg, #FFFFFF)",
          surface: "var(--nyaya-surface, #FFFFFF)",
          card: "var(--nyaya-card, #FFFFFF)",
          mint: "#EAF3ED",
          mintSubtle: "#F3F8F5",
          green: "#205C43",
          greenHover: "#174530",
          border: "var(--nyaya-green-border, #D5E5D9)",
          borderSubtle: "var(--border-subtle, #E2ECE5)",
          text: "#202824",
          textMuted: "#69736D",
          hover: "#F2F7F4",
          // Backward compatibility aliases
          gold: "#205C43",
          goldLight: "#2A7556",
          goldDark: "#174530",
          goldMuted: "rgba(32, 92, 67, 0.12)",
          goldGlow: "rgba(32, 92, 67, 0.15)",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderColor: {
        subtle: "var(--border-subtle)",
        default: "var(--border-default)",
        strong: "var(--border-strong)",
      },
      backgroundColor: {
        "surface-raised": "var(--surface-raised)",
        "surface-hover": "var(--surface-hover)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
