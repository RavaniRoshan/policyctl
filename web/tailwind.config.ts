import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)",
          subtle: "var(--bg-subtle)",
          overlay: "var(--bg-overlay)",
        },
        fg: {
          primary: "var(--fg-primary)",
          secondary: "var(--fg-secondary)",
          muted: "var(--fg-muted)",
          inverse: "var(--fg-inverse)",
        },
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
          strong: "var(--border-strong)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          muted: "var(--brand-muted)",
          subtle: "var(--brand-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          warm: "var(--accent-warm)",
          coral: "var(--accent-coral)",
          sky: "var(--accent-sky)",
          midnight: "var(--accent-midnight)",
        },
        success: { DEFAULT: "var(--success)", muted: "var(--success-muted)" },
        danger: { DEFAULT: "var(--danger)", muted: "var(--danger-muted)" },
        warning: { DEFAULT: "var(--warning)", muted: "var(--warning-muted)" },
        info: { DEFAULT: "var(--info)", muted: "var(--info-muted)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        sm: "var(--sh-sm)",
        md: "var(--sh-md)",
        lg: "var(--sh-lg)",
        brand: "var(--sh-brand)",
      },
      transitionTimingFunction: {
        fluid: "var(--ease-fluid)",
        spring: "var(--ease-spring)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        base: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      maxWidth: { prose: "42rem", content: "1280px" },
    },
  },
  plugins: [],
} satisfies Config;
