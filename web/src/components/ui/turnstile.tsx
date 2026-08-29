"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const TurnstileCtx = createContext<{
  siteKey: string | null;
  token: string | null;
  setToken: (t: string | null) => void;
}>({ siteKey: null, token: null, setToken: () => {} });

const SCRIPT_ID = "cf-turnstile-script";
const SITE_KEY_ENV = "VITE_TURNSTILE_SITE_KEY";

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(SCRIPT_ID)) return resolve();
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = "https://challenges.cloudflare.com/cdn-cgi/scripts/main/49514726/cloudflare-turnstile.min.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

/** Provider that injects the Turnstile script once and exposes the site key. */
export function TurnstileProvider({
  siteKey: forcedKey,
  children,
}: {
  siteKey?: string;
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(null);
  const envKey = (import.meta.env[SITE_KEY_ENV] as string | undefined) ?? forcedKey;
  useEffect(() => {
    loadTurnstileScript().catch((e) => console.error("Turnstile script load failed:", e));
  }, []);
  return (
    <TurnstileCtx.Provider value={{ siteKey: envKey ?? null, token, setToken }}>
      {children}
    </TurnstileCtx.Provider>
  );
}

export function useTurnstile() {
  return useContext(TurnstileCtx);
}

/** Renders the Cloudflare Turnstile challenge widget. */
export function TurnstileWidget({
  action = "auth",
  theme = "dark",
}: {
  action?: string;
  theme?: "light" | "dark" | "auto";
}) {
  const { siteKey, setToken } = useTurnstile();
  const containerRef = useRef<HTMLDivElement>(null);

  const render = () => {
    const container = containerRef.current;
    if (!container || !window.turnstile) return;
    // Clear any previous widget
    container.innerHTML = "";
    window.turnstile.render(container, {
      sitekey: siteKey ?? "",
      theme,
      action,
      callback: (t: string) => setToken(t),
      "error-callback": () => setToken(null),
      "timeout-callback": () => setToken(null),
    });
  };

  useEffect(() => {
    if (!siteKey) {
      console.warn("Turnstile: no site key configured — widget hidden");
      return;
    }
    const id = window.setTimeout(render, 0);
    return () => window.clearTimeout(id);
  }, [siteKey, theme, action]);

  if (!siteKey) return null;
  return <div ref={containerRef} />;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        opts: {
        sitekey: string;
        theme?: string;
        action?: string;
        callback?: (token: string) => void;
        "error-callback"?: () => void;
        "timeout-callback"?: () => void;
      },
      ) => string;
      reset: (id?: string) => void;
    };
  }
}
