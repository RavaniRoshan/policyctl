import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,md}"],
  plugins: [typography],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        primary: {
          50: "#f3f1ff",
          100: "#ebe5ff",
          200: "#d9cfff",
          300: "#bca8ff",
          400: "#9c7cff",
          500: "#8B7CF6",
          600: "#7c5cf0",
          700: "#6a45e0",
          800: "#5a3ac0",
          900: "#4d349a",
        },
      },
    },
  },
};
