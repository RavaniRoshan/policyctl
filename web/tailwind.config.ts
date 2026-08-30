import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        /* ── Brand (teal) ── */
        brand: {
          50: "var(--brand-50)", 100: "var(--brand-100)", 200: "var(--brand-200)",
          300: "var(--brand-300)", 400: "var(--brand-400)", 500: "var(--brand-500)",
          600: "var(--brand-600)", 700: "var(--brand-700)", 800: "var(--brand-800)",
          900: "var(--brand-900)",
          DEFAULT: "var(--brand)", hover: "var(--brand-hover)", muted: "var(--brand-muted)",
        },
        /* ── Accent (coral) ── */
        accent: {
          50: "var(--accent-50)", 100: "var(--accent-100)", 200: "var(--accent-200)",
          300: "var(--accent-300)", 400: "var(--accent-400)", 500: "var(--accent-500)",
          600: "var(--accent-600)", 700: "var(--accent-700)", 800: "var(--accent-800)",
          900: "var(--accent-900)",
          DEFAULT: "var(--accent)", hover: "var(--accent-hover)", muted: "var(--accent-muted)",
        },
        /* ── Backgrounds ── */
        bg: {
          primary: "var(--bg-primary)", surface: "var(--bg-surface)",
          elevated: "var(--bg-elevated)", overlay: "var(--bg-overlay)",
        },
        /* ── Foregrounds ── */
        fg: {
          primary: "var(--fg-primary)", secondary: "var(--fg-secondary)", muted: "var(--fg-muted)",
        },
        /* ── Borders ── */
        border: { DEFAULT: "var(--border)", hover: "var(--border-hover)" },
        /* ── Semantic ── */
        success: { DEFAULT: "var(--success)", muted: "var(--success-muted)" },
        danger: { DEFAULT: "var(--danger)", muted: "var(--danger-muted)" },
        warning: { DEFAULT: "var(--warning)", muted: "var(--warning-muted)" },
        info: { DEFAULT: "var(--info)", muted: "var(--info-muted)" },
        /* ── Legacy aliases (backward compat) ── */
        pc: {
          50: "var(--pc-50)", 100: "var(--pc-100)", 200: "var(--pc-200)",
          300: "var(--pc-300)", 400: "var(--pc-400)", 500: "var(--pc-500)",
          600: "var(--pc-600)", 700: "var(--pc-700)", 800: "var(--pc-800)",
          900: "var(--pc-900)", 950: "var(--pc-950)",
        },
        ac: {
          50: "var(--ac-50)", 100: "var(--ac-100)", 200: "var(--ac-200)",
          300: "var(--ac-300)", 400: "var(--ac-400)", 500: "var(--ac-500)",
          600: "var(--ac-600)", 700: "var(--ac-700)",
        },
        ab: {
          300: "var(--ab-300)", 400: "var(--ab-400)", 500: "var(--ab-500)",
          600: "var(--ab-600)", 700: "var(--ab-700)",
        },
        n: {
          0: "var(--n-0)", 50: "var(--n-50)", 100: "var(--n-100)", 200: "var(--n-200)",
          300: "var(--n-300)", 400: "var(--n-400)", 500: "var(--n-500)", 600: "var(--n-600)",
          700: "var(--n-700)", 800: "var(--n-800)", 900: "var(--n-900)", 950: "var(--n-950)",
          1000: "var(--n-1000)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)", xl: "var(--r-xl)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        glow: "var(--sh-glow-brand)", "glow-accent": "var(--sh-glow-accent)",
        sm: "var(--sh-sm)", md: "var(--sh-md)", lg: "var(--sh-lg)",
      },
      transitionTimingFunction: {
        pc: "var(--ease-smooth)", spring: "var(--ease-spring)", out: "var(--ease-out)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)", base: "var(--dur-base)", slow: "var(--dur-slow)", slower: "var(--dur-slower)",
      },
      maxWidth: { prose: "42rem", content: "1120px" },
    },
  },
  plugins: [],
} satisfies Config;
