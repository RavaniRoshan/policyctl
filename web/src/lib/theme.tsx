import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";
interface ThemeCtx {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "policyctl-theme";

function applyTheme(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", t === "dark");
}

function resolve(t: Theme): "light" | "dark" {
  if (t === "system") {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return t;
}

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitial());
  const [resolved, setResolved] = useState<"light" | "dark">(() => resolve(getInitial()));

  useEffect(() => {
    const r = resolve(theme);
    setResolved(r);
    applyTheme(r);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        if (theme === "system") {
          const r2 = resolve("system");
          setResolved(r2);
          applyTheme(r2);
        }
      };
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "light" ? "dark" : "light")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}