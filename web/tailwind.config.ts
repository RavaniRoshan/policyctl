import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
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
        success: "var(--success)", warn: "var(--warn)", danger: "var(--danger)", info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)", xl: "var(--r-xl)",
      },
      boxShadow: {
        glow: "var(--sh-glow)", sm: "var(--sh-sm)", md: "var(--sh-md)", lg: "var(--sh-lg)",
      },
      transitionTimingFunction: { pc: "var(--ease)" },
      maxWidth: { prose: "42rem", content: "1120px" },
    },
  },
  plugins: [],
} satisfies Config;
